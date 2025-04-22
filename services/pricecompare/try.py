from scrapegraphai.graphs import SmartScraperGraph

# Define the configuration for the scraping pipeline
graph_config = {
   "llm": {
       "api_key": "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",
       "model": "openai/gpt-4o-mini",
   },
   "verbose": True,
   "headless": False,
}

# Create the SmartScraperGraph instance
smart_scraper_graph = SmartScraperGraph(
    prompt="Extract useful information from the webpage, including a description of what the company does, founders and social media links",
    source="http://www.koronakert.hu",
    config=graph_config
)

# Run the pipeline
result = smart_scraper_graph.run()

import json
print(json.dumps(result, indent=4))