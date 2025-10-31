# Interactive Learning Assistant

An interactive teaching companion powered by Claude 3.5 Haiku that guides learners through any subject using brief explanations and guided questions.

## Features

- 🎓 Interactive teaching with questions and explanations
- 📊 Numeric slider for number-based answers
- ✅ Multiple-choice questions with four options
- 🎥 **Automatic YouTube video search** - finds short, relevant, highly-rated educational videos for incorrect answers
- 💬 Natural conversation flow

## Setup

### ⚠️ CORS Fix Required

This application requires a backend proxy to work because browsers cannot make direct requests to the Anthropic API due to CORS (Cross-Origin Resource Sharing) restrictions.

### Quick Start

1. **Deploy the Cloudflare Worker proxy** (required to fix CORS errors)
   - Follow the instructions in [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)
   - This will create a secure proxy that handles API requests
   - Your API keys stay secure in the worker's environment variables
   - **Required environment variables:**
     - `ANTHROPIC_API_KEY`: Your Anthropic API key
     - `YOUTUBE_API_KEY`: Your YouTube Data API v3 key (for video search feature)

2. **Get a YouTube Data API key** (for automatic video search)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "YouTube Data API v3"
   - Create credentials (API key)
   - Add the API key to your Cloudflare Worker environment variables as `YOUTUBE_API_KEY`

3. **Update the frontend**
   - Open `index.html`
   - Replace `YOUR_CLOUDFLARE_WORKER_URL_HERE` with your deployed worker URL
   - Example: `https://interactive-learning-assistant-proxy.your-subdomain.workers.dev`

4. **Open the application**
   - Open `index.html` in your browser, or
   - Deploy to GitHub Pages, Netlify, or any static hosting

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Backend Proxy**: Cloudflare Workers (serverless)
- **AI Model**: Claude 3.5 Haiku via Anthropic API

## Project Structure

```
.
├── index.html                    # Main application (frontend)
├── worker.js                     # Cloudflare Worker proxy (backend)
├── wrangler.toml                 # Cloudflare Workers configuration
├── CLOUDFLARE_DEPLOYMENT.md      # Deployment instructions
└── README.md                     # This file
```

## Why Do I Need a Proxy?

Web browsers block direct API calls to external services (like the Anthropic API) for security reasons. This is called CORS (Cross-Origin Resource Sharing).

**The solution**: A serverless proxy (Cloudflare Worker) that:
- Receives requests from your browser
- Adds your API key securely
- Forwards requests to the Anthropic API
- Returns responses to your browser

This keeps your API key secure (never exposed in browser code) and solves the CORS issue.

## Cost

- **Cloudflare Workers Free Tier**: 100,000 requests/day (plenty for personal use)
- **Anthropic API**: Pay-as-you-go pricing

## License

MIT License - see [LICENSE](./LICENSE) file for details
