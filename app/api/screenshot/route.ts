import { NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto'; // Import the crypto module for hashing

// --- Supabase Configuration ---
// Ensure these are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'screenshots'; // *** REPLACE with your actual bucket name ***

// *** ADDED LOGGING FOR ENV VARS ***
console.log("--- Supabase Env Vars ---");
console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? 'Loaded' : 'MISSING!');
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? 'Loaded (length: ' + (supabaseServiceKey?.length ?? 0) + ')' : 'MISSING!'); // Log length safely
console.log("-------------------------");


// Validate Supabase config
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Key environment variable is missing! Ensure .env.local is correct and server was restarted.");
    // Throw an error during startup if critical config is missing
    // throw new Error("Missing Supabase configuration in environment variables.");
}

// Initialize Supabase client (use service key for backend operations)
let supabase: SupabaseClient | null = null;
const getSupabaseClient = () => {
    // Initialize only once
    if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
             supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
             console.log("Supabase client initialized successfully.");
        } catch (error) {
             console.error("Error initializing Supabase client:", error);
        }
    } else if (!supabase && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
         console.error("Attempted to get Supabase client, but env vars missing!");
    }
    return supabase;
};


// --- Puppeteer Constants ---
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TIMEOUT_MS = 60000; // 60 seconds
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

// --- Helper Function: Generate Filename ---
const generateFilename = (url: string): string => {
    const hash = crypto.createHash('sha256').update(url).digest('hex');
    return `${hash}.png`;
};

// --- GET Request Handler ---
export async function GET(request: Request) {
    console.log(`[Request Start] Service Key is ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'NOT SET'}. URL: ${request.url}`);

    const supabaseClient = getSupabaseClient();
    // Ensure client is available before proceeding
    if (!supabaseClient) {
         console.error("FATAL: Supabase client is not available. Check initialization logs and env vars.");
         return NextResponse.json({ error: 'Server configuration error (Supabase)' }, { status: 500 });
    }

    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // --- 1. Get URL and Generate Filename ---
        const { searchParams } = new URL(request.url);
        const urlToScreenshot = searchParams.get('url');

        if (!urlToScreenshot) {
            return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
        }
        // Basic URL validation
        try { new URL(urlToScreenshot); } catch (_) {
            return NextResponse.json({ error: 'Invalid URL format provided' }, { status: 400 });
        }

        const filename = generateFilename(urlToScreenshot);
        console.log(`Processing URL: "${urlToScreenshot}", Filename: "${filename}"`);

        // --- 2. Check Supabase Cache ---
        console.log(`Checking cache for "${filename}"...`);
        let publicUrl: string | null = null;
        try {
            // First, try getting the public URL directly
            const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filename);
            if (urlData?.publicUrl && !urlData.publicUrl.includes('/render/path')) {
                 // If URL looks valid, confirm existence with list()
                 const { data: fileListData, error: listError } = await supabaseClient
                     .storage
                     .from(BUCKET_NAME)
                     .list(null, { search: filename, limit: 1 });

                 if (listError) {
                      console.error("Supabase cache check error (list):", listError);
                      // If auth error, fail fast
                      if (listError.message.includes('signature') || listError.message.includes('authorization')) {
                           throw new Error(`Supabase authentication error checking file: ${listError.message}. FIX SERVICE KEY!`);
                      }
                      // Otherwise, log and proceed to generate
                      console.warn("Proceeding to generate due to cache check error.");
                 } else if (fileListData && fileListData.length > 0) {
                      console.log(`Cache hit for "${filename}".`);
                      publicUrl = urlData.publicUrl; // Store the valid public URL
                 }
            }
        } catch (cacheCheckError: any) {
             console.error("Unexpected error during cache check:", cacheCheckError);
             // Handle potential errors during the check itself
        }

        // If we found a valid public URL in the cache, return it
        if (publicUrl) {
             console.log(`[Cache Hit] Returning URL: ${publicUrl}`);
             return NextResponse.json({ imageUrl: publicUrl });
        } else {
             console.log(`Cache miss for "${filename}", proceeding to generate.`);
        }

        // --- 3. Launch Puppeteer (if not cached) ---
        console.log("Launching Puppeteer browser...");
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                // '--single-process', // Removed this argument
                '--disable-gpu'
            ],
        });
        console.log("Browser launched.");

        page = await browser.newPage();
        console.log("Page opened.");
        await page.setUserAgent(USER_AGENT);
        await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

        // --- 4. Navigate ---
        console.log(`Navigating to: "${urlToScreenshot}"...`);
        let navigationResponse;
        let navigationErrorOccurred = false;
        try {
            navigationResponse = await page.goto(urlToScreenshot, { waitUntil: 'load', timeout: TIMEOUT_MS });
            console.log(`Navigation complete. Status: ${navigationResponse?.status() ?? 'N/A'}`);
        } catch (navError: any) {
            console.error(`Navigation error for "${urlToScreenshot}":`, navError);
            navigationErrorOccurred = true;
            if (navError.message.includes('Navigating frame was detached')) {
                 console.warn(`Caught "Navigating frame was detached". Proceeding...`);
                 navigationResponse = null;
            } else {
                // Rethrow other navigation errors
                throw new Error(`Navigation failed: ${navError.message}`);
            }
        }

        // Check response status if navigation didn't throw (or was detached frame)
        if (navigationResponse && !navigationResponse.ok()) {
            const status = navigationResponse.status();
            console.error(`Navigation failed with status: ${status}`);
            throw new Error(`Page load failed with status ${status}`);
        }

        // --- 5. Take Screenshot ---
        console.log("Attempting screenshot...");
        const delayMs = 2000;
        console.log(`Waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // *** ADDED CHECK: Ensure page is still connected before screenshot ***
        if (page.isClosed()) {
             console.error("Screenshot failed: Page was closed before screenshot could be taken.");
             throw new Error("Page closed prematurely before screenshot.");
        }

        console.log("Capturing screenshot...");
        const screenshotBuffer = await page.screenshot({ type: 'png' });
        console.log("Screenshot captured successfully.");

        // --- 6. Upload to Supabase ---
        console.log(`Uploading "${filename}" to bucket "${BUCKET_NAME}"...`);
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .upload(filename, screenshotBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
             if (uploadError.message.includes('signature') || uploadError.message.includes('authorization')) {
                 throw new Error(`Supabase authentication error uploading file: ${uploadError.message}. FIX SERVICE KEY!`);
            }
            throw new Error(`Upload failed: ${uploadError.message}`);
        }
        console.log("Upload successful:", uploadData?.path);

        // --- 7. Get Public URL of Newly Uploaded File ---
        const { data: finalUrlData, error: finalUrlError } = supabaseClient
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);

        if (finalUrlError) {
             console.error("Supabase error getting final public URL:", finalUrlError);
              throw new Error(`Failed to get public URL after upload: ${finalUrlError.message}`);
        }
        if (!finalUrlData?.publicUrl) {
             console.error("Public URL was null/empty after upload for:", filename);
             throw new Error("Failed to get public URL after upload.");
        }

        console.log(`[After Upload] Returning URL: ${finalUrlData.publicUrl}`);
        return NextResponse.json({ imageUrl: finalUrlData.publicUrl });

    } catch (error: any) {
        console.error("Error during operation:", error.message); // Log only message for cleaner top-level error
        // Provide specific feedback for auth errors
        const errorMessage = error.message.includes('Supabase authentication error')
            ? `Authentication Error: ${error.message}`
            : `Failed to process screenshot: ${error.message}`;
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );

    } finally {
        // --- Resource Cleanup (Puppeteer) ---
        console.log("Cleaning up Puppeteer resources...");
        if (page && !page.isClosed()) { // Check if page exists and isn't already closed
            try {
                 console.log("Closing page...");
                 await page.close();
                 console.log("Page closed.");
            } catch (e: any) { console.error("Error closing page:", e.message); }
        } else if (page?.isClosed()){
             console.log("Page cleanup skipped (already closed).");
        } else {
             console.log("Page cleanup skipped (was not initialized).");
        }
        if (browser) {
            try {
                 console.log("Closing browser...");
                 await browser.close();
                 console.log("Browser closed.");
            } catch (e: any) { console.error("Error closing browser:", e.message); }
        } else {
             console.log("Browser cleanup skipped.");
        }
        console.log("Cleanup finished.");
    }
}
