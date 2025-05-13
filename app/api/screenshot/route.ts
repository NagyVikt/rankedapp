import { NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto'; // Import the crypto module for hashing

// --- Supabase Configuration ---
// Ensure these are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'screenshots'; // *** REPLACE with your actual bucket name ***

// *** Logging for Environment Variables ***
console.log('--- Supabase Env Vars ---');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Loaded' : 'MISSING!');
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  supabaseServiceKey
    ? 'Loaded (length: ' + (supabaseServiceKey?.length ?? 0) + ')'
    : 'MISSING!',
);
console.log('-------------------------');

// Validate Supabase config at module load (optional, good for early feedback)
if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'CRITICAL: Supabase URL or Service Key environment variable is missing at module load! Ensure .env.local is correct and server was restarted.',
  );
  // Depending on deployment, you might not want to throw here if env vars are injected later.
  // Runtime checks in getSupabaseClient and the handler are also crucial.
}

// Initialize Supabase client (singleton pattern)
let supabase: SupabaseClient | null = null;
const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabase) {
    const su_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const su_key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (su_url && su_key) {
      try {
        supabase = createClient(su_url, su_key);
        console.log('Supabase client initialized successfully.');
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return null;
      }
    } else {
      console.error(
        'Attempted to initialize Supabase client, but NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars are missing!',
      );
      return null;
    }
  }
  return supabase;
};

// --- Puppeteer Constants ---
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TIMEOUT_MS = 60000; // 60 seconds
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

// --- Helper Function: Generate Filename ---
const generateFilename = (url: string): string => {
  const hash = crypto.createHash('sha256').update(url).digest('hex');
  return `${hash}.png`;
};

// --- GET Request Handler ---
export async function GET(request: Request) {
  console.log(
    `[Request Start] URL: ${request.url}. Service Key ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'seems set' : 'is NOT SET (check env vars)'}.`,
  );

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    console.error(
      'FATAL: Supabase client is not available. This usually means environment variables for Supabase are missing or incorrect. Check server logs for initialization errors.',
    );
    return NextResponse.json(
      {
        error:
          'Server configuration error: Supabase client could not be initialized.',
      },
      { status: 500 },
    );
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // --- 1. Get URL and Generate Filename ---
    const { searchParams } = new URL(request.url);
    const urlToScreenshot = searchParams.get('url');

    if (!urlToScreenshot) {
      return NextResponse.json(
        { error: "Missing 'url' query parameter." },
        { status: 400 },
      );
    }
    try {
      new URL(urlToScreenshot); // Basic URL validation
    } catch (_) {
      return NextResponse.json(
        { error: 'Invalid URL format provided.' },
        { status: 400 },
      );
    }

    const filename = generateFilename(urlToScreenshot);
    console.log(
      `Processing URL: "${urlToScreenshot}", Target Filename: "${filename}"`,
    );

    // --- 2. Check Supabase Cache ---
    console.log(
      `Checking cache for "${filename}" in bucket "${BUCKET_NAME}"...`,
    );
    let publicUrl: string | null = null;
    try {
      // supabaseClient.storage.from(...).getPublicUrl() is synchronous.
      // Its documented return type is { data: { publicUrl: string } }.
      // It does NOT return an 'error' object in its structure like async database/storage operations.
      // If an error occurs during its execution (e.g., invalid bucket name), it would throw an exception.
      const { data: publicUrlDataResult } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename); // Correct: No 'error' property to destructure here.

      // Check if publicUrlDataResult and its publicUrl property are valid.
      // The publicUrl might also point to a generic path like '/render/path/...' if the object
      // doesn't exist or if there's a configuration issue with public URLs for the bucket.
      if (
        publicUrlDataResult?.publicUrl &&
        !publicUrlDataResult.publicUrl.includes('/render/path')
      ) {
        console.log(
          `Potentially valid public URL from getPublicUrl(): "${publicUrlDataResult.publicUrl}". Verifying actual file existence with list().`,
        );

        // Now, confirm the file actually exists using list() because getPublicUrl() only constructs the URL string.
        // list() is an async operation and returns { data, error }.
        const { data: fileListData, error: listError } =
          await supabaseClient.storage
            .from(BUCKET_NAME)
            .list(undefined, { search: filename, limit: 1 }); // 'undefined' for path means search in root of bucket.

        if (listError) {
          // This error is from the list() operation.
          console.error(
            `Supabase cache check error (during list operation for "${filename}"):`,
            listError.message,
          );
          if (
            listError.message.includes('signature') ||
            listError.message.includes('authorization') ||
            listError.message.includes('authenticated')
          ) {
            throw new Error(
              `Supabase authentication/authorization error listing file: ${listError.message}. VERIFY SUPABASE SERVICE KEY AND BUCKET POLICIES.`,
            );
          }
          // For other list errors (e.g., network issues, temporary service unavailability),
          // treat as a cache miss and proceed to generate the screenshot.
          console.warn(
            'Proceeding to generate screenshot due to a non-auth error during cache list operation or if file not found by list.',
          );
        } else if (fileListData && fileListData.length > 0) {
          // File exists according to list()
          console.log(
            `Cache hit confirmed by list() for "${filename}". Using public URL: ${publicUrlDataResult.publicUrl}`,
          );
          publicUrl = publicUrlDataResult.publicUrl;
        } else {
          // File does not exist according to list()
          console.log(
            `Cache miss for "${filename}" (file not found by list() operation).`,
          );
        }
      } else {
        // This case means getPublicUrl() returned a null/empty/placeholder publicUrl, or publicUrlDataResult was null.
        console.log(
          `Initial getPublicUrl() for "${filename}" did not yield a usable public URL (URL was: ${publicUrlDataResult?.publicUrl || 'null/undefined'}). Treating as cache miss.`,
        );
      }
    } catch (cacheCheckPhaseError: any) {
      // This catch block handles:
      // 1. Errors thrown by getPublicUrl() itself (e.g., misconfiguration, invalid bucket name).
      // 2. Errors thrown by `await supabaseClient.storage.from(...).list(...)` if not caught by its own 'if (listError)'
      //    (e.g. if listError was an auth error and re-thrown).
      // 3. Any other unexpected errors within this try block.
      console.error(
        `Error during Supabase cache check phase for "${filename}":`,
        cacheCheckPhaseError.message,
      );
      if (
        cacheCheckPhaseError.message.includes('Supabase authentication') ||
        cacheCheckPhaseError.message.includes('authorization')
      ) {
        throw cacheCheckPhaseError; // Re-throw auth errors to be caught by the main handler and fail fast.
      }
      // For other errors, log and treat as a cache miss, then proceed to generate.
      console.warn(
        'Proceeding to generate screenshot due to an error encountered in the cache check phase.',
      );
    }

    if (publicUrl) {
      console.log(
        `[Cache Hit] Returning cached URL for "${filename}": ${publicUrl}`,
      );
      return NextResponse.json({ imageUrl: publicUrl });
    } else {
      console.log(
        `[Cache Miss] Proceeding to generate screenshot for "${filename}".`,
      );
    }

    // --- 3. Launch Puppeteer (if not cached) ---
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
    console.log('Puppeteer browser launched.');

    page = await browser.newPage();
    console.log('New page opened in Puppeteer.');
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

    // --- 4. Navigate ---
    console.log(`Navigating to: "${urlToScreenshot}"...`);
    const navigationResponse = await page.goto(urlToScreenshot, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUT_MS,
    });
    console.log(
      `Navigation complete. Status: ${navigationResponse?.status() ?? 'N/A'}`,
    );

    if (navigationResponse && !navigationResponse.ok()) {
      const status = navigationResponse.status();
      console.error(
        `Navigation failed with HTTP status: ${status} for URL: ${urlToScreenshot}`,
      );
      throw new Error(
        `Page load failed with status ${status}. URL: ${urlToScreenshot}`,
      );
    }

    // --- 5. Take Screenshot ---
    const screenshotDelayMs = 2000;
    console.log(
      `Waiting ${screenshotDelayMs}ms for potential dynamic content rendering...`,
    );
    await new Promise((resolve) => setTimeout(resolve, screenshotDelayMs));

    if (page.isClosed()) {
      console.error(
        'Screenshot failed: Page was closed before screenshot could be taken.',
      );
      throw new Error('Page closed prematurely before screenshot.');
    }

    console.log('Capturing screenshot...');
    const screenshotBuffer = await page.screenshot({ type: 'png' });
    console.log(
      'Screenshot captured successfully (buffer size: ' +
        screenshotBuffer.length +
        ' bytes).',
    );

    // --- 6. Upload to Supabase ---
    console.log(`Uploading "${filename}" to bucket "${BUCKET_NAME}"...`);
    const { data: uploadData, error: uploadError } =
      await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(filename, screenshotBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      if (
        uploadError.message.includes('signature') ||
        uploadError.message.includes('authorization') ||
        uploadError.message.includes('authenticated')
      ) {
        throw new Error(
          `Supabase authentication/authorization error uploading file: ${uploadError.message}. VERIFY SUPABASE SERVICE KEY AND BUCKET POLICIES (e.g. allow authenticated uploads).`,
        );
      }
      throw new Error(`Upload to Supabase failed: ${uploadError.message}`);
    }
    console.log('Upload successful. Supabase path:', uploadData?.path);

    // --- 7. Get Public URL of Newly Uploaded File ---
    // We need to call getPublicUrl() again for the newly uploaded file.
    const { data: finalUrlObject } = supabaseClient.storage // Again, getPublicUrl is sync and returns { data: { publicUrl: string } }
      .from(BUCKET_NAME)
      .getPublicUrl(filename); // filename should be same as uploadData.path if no transformation

    if (!finalUrlObject?.publicUrl) {
      console.error(
        'Public URL was null/empty after upload and second getPublicUrl call for:',
        filename,
      );
      throw new Error(
        'Failed to retrieve public URL from Supabase after successful upload. The final URL object or its publicUrl property was unexpectedly null.',
      );
    }

    console.log(
      `[After Upload] Returning newly generated URL: ${finalUrlObject.publicUrl}`,
    );
    return NextResponse.json({ imageUrl: finalUrlObject.publicUrl });
  } catch (error: any) {
    console.error(
      '[Operation Error] An error occurred in the GET handler:',
      error,
    ); // Log the full error object
    // console.error("[Operation Error] Error message:", error.message);
    // console.error("[Operation Error] Error stack:", error.stack);

    const errorMessage =
      error.message.includes('Supabase authentication') ||
      error.message.includes('authorization')
        ? `Authentication/Authorization Error: ${error.message}`
        : `Failed to process screenshot: ${error.message || 'An unknown error occurred. Check server logs.'}`;

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  } finally {
    // --- Resource Cleanup (Puppeteer) ---
    console.log('Initiating Puppeteer resource cleanup...');
    if (page && !page.isClosed()) {
      try {
        console.log('Closing Puppeteer page...');
        await page.close();
        console.log('Puppeteer page closed.');
      } catch (e: any) {
        console.error('Error closing Puppeteer page:', e.message);
      }
    } else if (page?.isClosed()) {
      console.log('Puppeteer page cleanup skipped (already closed).');
    } else {
      console.log(
        'Puppeteer page cleanup skipped (page was not initialized or already null).',
      );
    }

    if (browser) {
      try {
        console.log('Closing Puppeteer browser...');
        await browser.close();
        console.log('Puppeteer browser closed.');
      } catch (e: any) {
        console.error('Error closing Puppeteer browser:', e.message);
      }
    } else {
      console.log(
        'Puppeteer browser cleanup skipped (browser was not initialized, already null, or launch failed).',
      );
    }
    console.log('Puppeteer cleanup finished.');
  }
}
