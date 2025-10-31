# Cloudflare Worker Deployment Guide

This guide explains how to deploy the Anthropic API proxy to Cloudflare Workers.

## Prerequisites

1. A Cloudflare account (free tier works fine)
2. Node.js installed on your computer
3. Your Anthropic API key

## Step 1: Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with Cloudflare.

## Step 3: Deploy the Worker

From this directory, run:

```bash
wrangler deploy
```

## Step 4: Set Your API Key

After deployment, add your Anthropic API key as a secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key.

## Step 5: Get Your Worker URL

After deployment, Wrangler will display your worker URL. It will look like:

```
https://interactive-learning-assistant-proxy.<your-subdomain>.workers.dev
```

## Step 6: Update Your Frontend

Update the `API_ENDPOINT` in `index.html` to point to your worker URL:

```javascript
const API_ENDPOINT = 'https://interactive-learning-assistant-proxy.<your-subdomain>.workers.dev';
```

## Testing

You can test your worker using curl:

```bash
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-haiku-4.5-20250929",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Troubleshooting

### CORS Issues
- Make sure the `Access-Control-Allow-Origin` in `worker.js` matches your GitHub Pages URL
- Check that your GitHub Pages URL uses HTTPS

### API Key Issues
- Verify your API key is set correctly: `wrangler secret list`
- Try setting it again: `wrangler secret put ANTHROPIC_API_KEY`

### Worker Not Responding
- Check worker logs: `wrangler tail`
- Verify deployment: `wrangler deployments list`

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request

This should be more than sufficient for a personal learning assistant.

## Alternative: Environment Variables via Dashboard

If you prefer using the Cloudflare dashboard:

1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages
3. Select your worker
4. Go to Settings > Variables
5. Add an environment variable: `ANTHROPIC_API_KEY` (type: Secret)
6. Paste your API key
