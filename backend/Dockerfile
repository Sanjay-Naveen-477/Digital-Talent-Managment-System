FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

# Copy application code
COPY . .

# Use the PORT environment variable injected by Render, fallback to 5000
ENV PORT=5000

# Run with gunicorn
CMD gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app
