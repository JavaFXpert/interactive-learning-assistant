# Cloudflare Worker Deployment Guide

This guide explains how to deploy the Anthropic API proxy to Cloudflare Workers.

## Prerequisites

1. A Cloudflare account (free tier works fine) - [Sign up here](https://dash.cloudflare.com/sign-up)
2. Your Anthropic API key - [Get one here](https://console.anthropic.com/)

## Method 1: Deploy via Cloudflare Dashboard (Easiest)

### Step 1: Login to Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Login to your account
3. Navigate to **Workers & Pages** in the left sidebar

### Step 2: Create a New Worker

1. Click **Create** button
2. Click **Create Worker**
3. Give it a name (e.g., `anthropic-proxy`)
4. Click **Deploy**

### Step 3: Edit the Worker Code

1. After deployment, click **Edit Code**
2. Delete all existing code in the editor
3. Copy and paste the **entire contents** of `worker.js` from this repository
4. Click **Save and Deploy**

### Step 4: Add Your API Key

1. Go back to the worker overview (click the worker name in breadcrumbs)
2. Click **Settings** tab
3. Click **Variables** in the left menu
4. Under "Environment Variables", click **Add variable**
5. Set:
   - **Variable name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key
   - **Type**: Check "Encrypt" to make it a secret
6. Click **Deploy**

### Step 5: Get Your Worker URL

Your worker URL will be displayed at the top of the page:
```
https://anthropic-proxy.<your-subdomain>.workers.dev
```

Copy this URL - you'll need it in the next step.

### Step 6: Update Your Frontend

1. Open `index.html` in a text editor
2. Find line 502 (around there) with `const API_ENDPOINT = 'YOUR_CLOUDFLARE_WORKER_URL_HERE';`
3. Replace it with your worker URL:
   ```javascript
   const API_ENDPOINT = 'https://anthropic-proxy.<your-subdomain>.workers.dev';
   ```
4. Save the file

### Step 7: Test It!

Open `index.html` in your browser and try asking a question. It should work!

---

## Method 2: Deploy via Command Line (For Developers)

### Prerequisites

- Node.js installed on your computer

### Step 1: Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 3: Deploy the Worker

From this directory, run:

```bash
wrangler deploy
```

### Step 4: Set Your API Key

After deployment, add your Anthropic API key as a secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key.

### Step 5: Get Your Worker URL

After deployment, Wrangler will display your worker URL. It will look like:

```
https://interactive-learning-assistant-proxy.<your-subdomain>.workers.dev
```

### Step 6: Update Your Frontend

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
