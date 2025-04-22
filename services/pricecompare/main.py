# main.py
# Price Compare Microservice for Google Hungary (google.hu) and HUF

import os
import urllib.parse
import re
import json
import logging
from fastapi import FastAPI, HTTPException
from langchain_openai import ChatOpenAI
from browser_use.agent.service import Agent, AgentHistoryList, ActionResult
from browser_use.browser.browser import Browser, BrowserConfig, BrowserContextConfig
# ---> Re-import BrowserContextWindowSize <---
from browser_use.browser.context import BrowserContextWindowSize

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Price Compare Microservice")

# Constants
COOKIES_FILE = 'google_cookies.json'

# 1) One LLM instance for all calls
llm = ChatOpenAI(
    model_name="gpt-4o",
    temperature=0.0,
)

# --- BROWSER CONFIGURATION ---
persistent_user_data_dir = os.path.join(os.path.expanduser("~"), ".pricecompare_browser_profile")
logger.info(f"Using persistent browser profile directory: {persistent_user_data_dir}")
os.makedirs(persistent_user_data_dir, exist_ok=True)

config = BrowserConfig(
    headless=False,
    user_data_dir=persistent_user_data_dir,
    disable_security=False,
    # Keep --start-maximized, doesn't hurt
    launch_args=["--start-maximized"],
    default_viewport=None,
    context_config=BrowserContextConfig(
        disable_security=False,
        no_viewport=True, # Keep this so the browser window controls the viewport
        # ---> Explicitly set browser window size <---
        # Adjust width/height if your screen resolution is different
        browser_window_size=BrowserContextWindowSize(width=1920, height=1080),
    ),
)
# Initialize the global browser object
browser = Browser(config=config)
# --- END OF BROWSER CONFIGURATION ---

# --- fetch_cheapest_hu function ---
# Use the version from the previous response, which includes the
# refined task_prompt (JS evaluate hint, wait, iframe hint)
# and the cookie capture logic. No changes needed inside this function itself.
async def capture_and_save_cookies(context, filename):
    """Helper function to capture and save cookies."""
    try:
        logger.info("Attempting to capture cookies from browser context...")
        cookies = await context.cookies()
        with open(filename, 'w') as f:
            json.dump(cookies, f, indent=2)
        logger.info(f"Successfully captured and saved {len(cookies)} cookies to {filename}")
        return True
    except Exception as cookie_err:
        logger.error(f"Failed to capture or save cookies to {filename}: {cookie_err}", exc_info=True)
        return False

async def fetch_cheapest_hu(query: str) -> dict:
    """Navigate Google.hu, zoom out, accept cookies, extract listing, and capture cookies."""
    hu_query = f"{query} ár Ft"
    encoded = urllib.parse.quote_plus(hu_query)
    search_url = f"https://www.google.hu/search?q={encoded}&gl=hu&hl=hu"
    logger.info(f"Attempting to fetch cheapest price for query: '{query}' from URL: {search_url}")

    task_prompt = (
        f"Go to '{search_url}'. "
        "**Then, use your specific JavaScript execution capability, similar to Playwright's page.evaluate(), to run the code: document.body.style.zoom = '0.75';**. "
        "After attempting the zoom, wait for 2 seconds to allow rendering. "
        "Next, look for the cookie consent banner (it might be inside an iframe). **If** a button with the exact text 'Összes elfogadása' is visible within the banner or its potential iframe, click that specific button. "
        "Then, scroll down slightly (e.g., 200-300 pixels) to ensure results are loaded. "
        "Finally, analyze the search results (including shopping results if present) and extract the single cheapest item's price, store name, and the direct URL to the product. "
        "Format the final output strictly as a JSON object string containing a key 'cheapest_item', whose value is another JSON object with keys 'price_huf' (the price as a number or string), 'store_name' (string), and 'product_url' (string)."
    )

    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser=browser,
    )

    cheapest_data_to_return = None
    try:
        result_history: AgentHistoryList = await agent.run()
        logger.info(f"Agent task completed.")

        if hasattr(browser, 'context') and browser.context:
            await capture_and_save_cookies(browser.context, COOKIES_FILE)
        else:
            logger.warning("Could not access browser.context via the global browser object to capture cookies.")

        final_result_str = None
        for action_result in reversed(result_history.all_results):
            if action_result.is_done and action_result.extracted_content:
                final_result_str = action_result.extracted_content
                logger.info(f"Found final result string from done action: {final_result_str}")
                break

        if not final_result_str:
            logger.error("Agent finished but no final result string was found in the history.")
            raise ValueError("Agent did not produce a final result string.")

        try:
            parsed_json = json.loads(final_result_str)
            cheapest_item_data = parsed_json.get("cheapest_item")

            if not isinstance(cheapest_item_data, dict) or not all(k in cheapest_item_data for k in ['price_huf', 'store_name', 'product_url']):
                logger.error(f"Parsed JSON['cheapest_item'] is not a valid dictionary with required keys: {cheapest_item_data}")
                raise ValueError("Parsed agent result['cheapest_item'] is not the expected dictionary structure.")
            cheapest_data_to_return = cheapest_item_data

        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse final result string as JSON: '{final_result_str}'. Error: {json_err}")
            raise ValueError(f"Agent produced invalid JSON output: {final_result_str}")
        except Exception as e:
             logger.error(f"Error processing parsed JSON '{final_result_str}': {e}", exc_info=True)
             raise ValueError(f"Error processing agent JSON result: {e}")

    except Exception as e:
        logger.error(f"Agent execution or result processing failed: {e}", exc_info=True)
        if not isinstance(e, ValueError):
             raise ValueError(f"Agent failed to process the request: {e}")
        else:
             raise e

    if not cheapest_data_to_return:
        logger.error("Logic error: cheapest_data_to_return is unexpectedly empty before return.")
        raise ValueError("Failed to get cheapest item data")

    logger.info(f"Successfully parsed cheapest item data: {cheapest_data_to_return}")
    return cheapest_data_to_return

# --- compare_price function (Unchanged) ---
@app.post("/compare")
async def compare_price(payload: dict):
    # (Code from the previous response - no changes needed here)
    # ... (rest of the function) ...
    query = payload.get("query")
    current_huf_input = payload.get("currentPriceHUF")

    logger.info(f"Received price comparison request: query='{query}', currentPriceHUF={current_huf_input}")

    if not query or current_huf_input is None:
        logger.error("Bad request: 'query' and 'currentPriceHUF' are required.")
        raise HTTPException(status_code=400, detail="query and currentPriceHUF are required")

    try:
        current_huf = float(current_huf_input)
    except (ValueError, TypeError):
        logger.error(f"Bad request: 'currentPriceHUF' must be a number. Received: {current_huf_input}")
        raise HTTPException(status_code=400, detail="currentPriceHUF must be a valid number")

    try:
        cheapest_item_details = await fetch_cheapest_hu(query)
    except ValueError as e:
        logger.error(f"Agent/Parsing value error for query '{query}': {e}")
        raise HTTPException(status_code=502, detail=f"Agent or Parsing Error: {e}")
    except Exception as e:
        logger.error(f"Unexpected server error during fetch for query '{query}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    price_huf_value = cheapest_item_details.get("price_huf")
    if price_huf_value is None:
        logger.error(f"Parsed data missing 'price_huf' field: {cheapest_item_details}")
        raise HTTPException(status_code=502, detail="Invalid price data structure after parsing (missing price_huf)")

    price_huf_str = str(price_huf_value)
    digits = re.sub(r"[^0-9]", "", price_huf_str)

    try:
        if not digits:
             raise ValueError("Price string/number contained no digits after stripping")
        lowest = int(digits)
    except ValueError as e:
         logger.error(f"Could not convert extracted price '{price_huf_value}' (digits: '{digits}') to integer: {e}")
         raise HTTPException(status_code=502, detail=f"Invalid price format received: '{price_huf_value}'")

    if lowest <= 0:
         logger.warning(f"Extracted lowest price {lowest} is not positive.")
         suggestion = "Lowest price found was zero or negative, cannot provide comparison."
    else:
        diff_pct = round((current_huf - lowest) / lowest * 100)
        huf_format = lambda x: f"{x:,.0f}\u00A0Ft".replace(",", " ")
        current_huf_fmt = huf_format(current_huf)
        lowest_fmt = huf_format(lowest)

        if diff_pct > 5:
            suggestion = f"Your price ({current_huf_fmt}) is {diff_pct}% above the lowest found ({lowest_fmt}); consider lowering."
        elif diff_pct < -5:
            suggestion = f"Your price ({current_huf_fmt}) is {abs(diff_pct)}% below the lowest found ({lowest_fmt}); you could potentially raise it."
        else:
             suggestion = f"Your price ({current_huf_fmt}) is competitive with the lowest found ({lowest_fmt})."

    logger.info(f"Comparison result for query '{query}': {suggestion}")
    return {"cheapest": cheapest_item_details, "suggestion": suggestion}

# --- Run instructions and optional events (Unchanged) ---
# ...