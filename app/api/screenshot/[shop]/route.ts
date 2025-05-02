import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Config - Adjust these as needed
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TIMEOUT_MS = 15000; // 15 seconds timeout for page load/screenshot

// Determine if running locally or on Vercel/similar serverless env
const isDev = process.env.NODE_ENV === 'development';

export async function GET(req: NextRequest) {
  console.log("--- [GET /api/screenshot] Request received ---");

  const searchParams = req.nextUrl.searchParams;
  const urlToScreenshot = searchParams.get('url');
  console.log(`Received URL to screenshot: "${urlToScreenshot}"`);

  if (!urlToScreenshot) {
    console.error("Missing 'url' query parameter.");
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  // Validate the URL (basic check)
  try {
    new URL(urlToScreenshot); // Check if it's a valid URL format
    console.log(`URL "${urlToScreenshot}" appears valid.`);
  } catch (error) {
    console.error(`Invalid URL format: "${urlToScreenshot}"`, error);
    return NextResponse.json({ error: 'Invalid URL format provided' }, { status: 400 });
  }

  let browser = null;
  let page = null;
  let screenshotBuffer: Buffer | null = null;

  try {
    console.log("Attempting to launch browser...");

    // --- Browser Launch ---
    // Use local Chrome install in dev, use bundled chromium in production (Vercel)
    const executablePath = isDev
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Example macOS path, adjust for your OS
      // ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Example Windows path
      : await chromium.executablePath();

    console.log(`Using executable path: ${isDev ? '(local)' : executablePath}`);

    // Ensure necessary args for serverless environments
    const browserArgs = [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process' // Often needed in resource-constrained environments
    ];
    console.log("Browser launch arguments:", browserArgs);


    browser = await puppeteer.launch({
      args: browserArgs,
      executablePath: executablePath,
      headless: isDev ? true : chromium.headless, // Use chromium.headless in prod, can be true/false/'new' in dev
      ignoreHTTPSErrors: true, // Be cautious with this in production
    });
    console.log("Browser launched successfully.");

    // --- Page Navigation ---
    page = await browser.newPage();
    console.log("New page created.");

    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    console.log(`Viewport set to ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}.`);

    console.log(`Navigating to URL: "${urlToScreenshot}" with ${TIMEOUT_MS}ms timeout...`);
    // waitUntil: 'networkidle0' waits until there are no more than 0 network connections for at least 500 ms.
    // 'load' or 'domcontentloaded' might be faster but less reliable for capturing fully rendered pages.
    const navigationResponse = await page.goto(urlToScreenshot, {
        waitUntil: 'networkidle2', // Wait until there are no more than 2 network connections for 500ms
        timeout: TIMEOUT_MS
    });
    console.log(`Navigation complete. Status: ${navigationResponse?.status() ?? 'N/A'}`);

    // Optional: Wait for a specific element if needed, or add a fixed delay
    // await page.waitForSelector('#some-element-that-indicates-load', { timeout: 5000 });
    // await page.waitForTimeout(1000); // Wait 1 second after load (use sparingly)
    // console.log("Optional wait finished.");

    // --- Taking Screenshot ---
    console.log("Taking screenshot...");
    screenshotBuffer = await page.screenshot({
      type: 'png', // 'jpeg' is also an option
      // fullPage: false, // Set to true to capture the entire scrollable page
      // quality: 80, // For JPEG type
    });
    console.log(`Screenshot taken successfully. Buffer size: ${screenshotBuffer?.length} bytes.`);

  } catch (error: any) {
    console.error("Error during Puppeteer operation:", error);
    // Log specific details if available
    if (error.message) {
        console.error("Error message:", error.message);
    }
    // Return a generic server error
    return NextResponse.json(
        { error: 'Failed to generate screenshot', details: error.message || 'Unknown error' },
        { status: 500 }
    );

  } finally {
    // --- Cleanup ---
    console.log("Cleaning up resources...");
    if (page) {
      try {
        await page.close();
        console.log("Page closed.");
      } catch (closeError) {
        console.error("Error closing page:", closeError);
      }
    }
    if (browser) {
      try {
        await browser.close();
        console.log("Browser closed.");
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }

  // --- Return Response ---
  if (screenshotBuffer) {
    console.log("--- [GET /api/screenshot] Request finished successfully. Sending image response. ---");
    // Return the image buffer
    return new NextResponse(screenshotBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png', // Match the screenshot type
        'Content-Length': screenshotBuffer.length.toString(),
        // Optional: Add caching headers if appropriate
        // 'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } else {
    // This case should ideally be caught in the try/catch, but as a fallback:
    console.error("--- [GET /api/screenshot] Failed: Screenshot buffer is null after execution. ---");
    return NextResponse.json({ error: 'Screenshot generation failed unexpectedly.' }, { status: 500 });
  }
}
