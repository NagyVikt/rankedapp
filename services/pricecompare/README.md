# Price Compare Microservice

This microservice uses [Browser-use](https://github.com/browser-use/browser-use) to drive a headless browser, scrape Google Shopping for the cheapest item, and expose a REST endpoint via FastAPI.

## Setup (Local)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium