# Dockerfile
FROM python:3.11-slim

# Install system deps for Playwright
RUN apt-get update && \
    apt-get install -y wget ca-certificates \
       libnss3 libatk1.0-0 libatk-bridge2.0-0 \
       libcups2 libdrm2 libxrandr2 libgbm1 libxcomposite1 \
       libxdamage1 libxss1 libxtst6 libasound2 && \
    rm -rf /var/lib/apt/lists/*

# Install your app and Playwright
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev
RUN pip install playwright
RUN playwright install --with-deps

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
