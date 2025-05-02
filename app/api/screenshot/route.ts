import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Buffer } from 'buffer';
import fs from 'fs'; // Import fs for file system operations
import path from 'path'; // Import path for constructing file paths

// Config - Adjust these as needed
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TIMEOUT_MS = 20000; // Increased timeout slightly
const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'images', 'screenshots'); // Define screenshot directory
const SCREENSHOT_PUBLIC_PATH = '/images/screenshots'; // Public URL path

// Determine if running locally or on Vercel/similar serverless env
const isDev = process.env.NODE_ENV === 'development';

// Utility to slugify a URL (needed here to create filename)
function slugify(url: string): string {
  if (typeof url !== 'string') return '';
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9\-]+/g, "-") // Allow hyphens, replace others
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .toLowerCase();
}

// --- Handler for HEAD requests (Check if file exists) ---
export async function HEAD(req: NextRequest) {
    console.log("--- [HEAD /api/screenshot] Check request received ---");
    const searchParams = req.nextUrl.searchParams;
    const urlToCheck = searchParams.get('url');

    if (!urlToCheck) {
        return new NextResponse(null, { status: 400, statusText: "Missing 'url' query parameter" });
    }

    const slug = slugify(urlToCheck);
    if (!slug) {
        return new NextResponse(null, { status: 400, statusText: "Failed to generate valid filename slug" });
    }
    const filename = `${slug}.png`;
    const filePath = path.join(SCREENSHOT_DIR, filename);
    console.log(`Checking for file: ${filePath}`);

    try {
        // NOTE: This check might not work reliably in serverless environments after initial deployment.
        if (fs.existsSync(filePath)) {
            console.log(`File found at ${filePath}.`);
            // Return 200 OK if file exists
            return new NextResponse(null, { status: 200 });
        } else {
            console.log(`File not found at ${filePath}.`);
            // Return 404 Not Found if file doesn't exist
            return new NextResponse(null, { status: 404 });
        }
    } catch (err: any) {
        console.error(`Error checking file existence at ${filePath}:`, err);
        // Return 500 Internal Server Error if check fails
        return new NextResponse(null, { status: 500, statusText: err.message || 'Error checking file' });
    }
}


// --- Handler for GET requests (Generate screenshot if needed) ---
export async function GET(req: NextRequest) {
  console.log("--- [GET /api/screenshot] Generate request received ---");

  const searchParams = req.nextUrl.searchParams;
  const urlToScreenshot = searchParams.get('url');
  console.log(`Received URL to screenshot: "${urlToScreenshot}"`);

  if (!urlToScreenshot) {
    console.error("Missing 'url' query parameter.");
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  let validUrl: URL;
  try {
    validUrl = new URL(urlToScreenshot); // Validate and parse URL
    console.log(`URL "${urlToScreenshot}" appears valid.`);
  } catch (error) {
    console.error(`Invalid URL format: "${urlToScreenshot}"`, error);
    return NextResponse.json({ error: 'Invalid URL format provided' }, { status: 400 });
  }

  // --- File Handling ---
  const slug = slugify(urlToScreenshot);
  if (!slug) {
      console.error(`Failed to generate slug for URL: "${urlToScreenshot}"`);
      return NextResponse.json({ error: 'Failed to generate valid filename slug' }, { status: 400 });
  }
  const filename = `${slug}.png`;
  const filePath = path.join(SCREENSHOT_DIR, filename);
  const publicImagePath = `${SCREENSHOT_PUBLIC_PATH}/${filename}`;
  console.log(`Target file path: ${filePath}`);
  console.log(`Public image path: ${publicImagePath}`);

  // --- Check if image already exists (redundant check, HEAD should be used first, but good safeguard) ---
  try {
      if (fs.existsSync(filePath)) {
          console.log(`Screenshot already exists at ${filePath} (GET request). Returning existing path.`);
          // Return 200 OK with the path, indicating it already existed
          return NextResponse.json({
              message: 'Screenshot already exists.',
              path: publicImagePath
          }, { status: 200 });
      }
  } catch (err) {
      console.warn(`Could not check for existing file at ${filePath} (GET request):`, err);
  }

  // --- Screenshot Generation ---
  let browser = null;
  let page = null;
  let screenshotBuffer: Buffer | null = null;
  let executablePath: string | null = null;

  try {
    console.log("Attempting to launch browser...");
    // Determine executable path (same logic as before)
    if (isDev) {
        const possiblePaths = [
            '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser', '/usr/bin/chromium',
            '/snap/bin/chromium',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // Windows (x86)
        ];
        executablePath = possiblePaths.find(path => fs.existsSync(path)) || null;
        if (!executablePath) {
            console.error(`*** Local Chrome/Chromium not found. Checked: ${possiblePaths.join(', ')} ***`);
            return NextResponse.json({ error: 'Failed to find local Chrome/Chromium executable for development.' }, { status: 500 });
        }
        console.log(`Using local executable path: ${executablePath}`);
    } else {
        executablePath = await chromium.executablePath();
        console.log(`Using production executable path: ${executablePath}`);
    }

    const browserArgs = [
        ...(isDev ? [] : chromium.args),
        '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        '--single-process', '--disable-gpu', '--no-zygote'
    ];
    console.log("Browser launch arguments:", browserArgs);

    browser = await puppeteer.launch({
      args: browserArgs, executablePath: executablePath,
      headless: isDev ? true : chromium.headless, ignoreHTTPSErrors: true,
    });
    console.log("Browser launched successfully.");

    page = await browser.newPage();
    console.log("New page created.");
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    console.log(`Navigating to URL: "${urlToScreenshot}"...`);
    const navigationResponse = await page.goto(urlToScreenshot, { waitUntil: 'networkidle2', timeout: TIMEOUT_MS });
    console.log(`Navigation complete. Status: ${navigationResponse?.status() ?? 'N/A'}`);

    if (!navigationResponse || !navigationResponse.ok()) {
        throw new Error(`Navigation failed with status: ${navigationResponse?.status() ?? 'unknown'}`);
    }

    console.log("Taking screenshot...");
    screenshotBuffer = await page.screenshot({ type: 'png' });
    console.log(`Screenshot taken successfully. Buffer size: ${screenshotBuffer?.length} bytes.`);

  } catch (error: any) {
    console.error("Error during Puppeteer operation:", error);
    const details = error.message || 'Unknown error during screenshot generation';
    return NextResponse.json({ error: 'Failed to generate screenshot', details }, { status: 500 });
  } finally {
    console.log("Cleaning up Puppeteer resources...");
    if (page) await page.close().catch(e => console.error("Error closing page:", e));
    if (browser) await browser.close().catch(e => console.error("Error closing browser:", e));
  }

  // --- Save Screenshot Buffer ---
  if (screenshotBuffer) {
    try {
        console.log(`Attempting to save screenshot to: ${filePath}`);
        // Ensure the directory exists
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        console.log(`Directory ${SCREENSHOT_DIR} ensured/created.`);
        fs.writeFileSync(filePath, screenshotBuffer);
        console.log(`Screenshot saved successfully to ${filePath}`);

        // Return success response with the public path
        // Use 201 Created because the GET request resulted in resource creation
        return NextResponse.json({
            message: 'Screenshot generated and saved successfully.',
            path: publicImagePath
        }, { status: 201 });

    } catch (error: any) {
        console.error(`Failed to save screenshot to ${filePath}:`, error);
        return NextResponse.json({
            error: 'Screenshot generated but failed to save.',
            details: error.message || 'Unknown file system error'
        }, { status: 500 });
    }
  } else {
    console.error("Screenshot buffer is null after generation attempt.");
    return NextResponse.json({ error: 'Screenshot generation failed, buffer is null.' }, { status: 500 });
  }
}
