/**
 * Cloudflare Worker - Anthropic API Proxy with YouTube Video Search
 *
 * This worker acts as a proxy between your frontend and external APIs:
 * - Anthropic API: For Claude AI responses
 * - YouTube Data API v3: For searching educational videos
 *
 * It handles CORS and securely manages your API keys.
 *
 * Required Environment Variables:
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 * - YOUTUBE_API_KEY: Your YouTube Data API v3 key
 *
 * Deploy this to Cloudflare Workers and set both keys in the environment variables.
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders()
      });
    }

    // Route to appropriate handler based on URL path
    const url = new URL(request.url);

    if (url.pathname === '/search-video') {
      return handleVideoSearch(request, env);
    }

    // Default: Anthropic API proxy
    return handleAnthropicProxy(request, env);
  }
};

/**
 * Handle Anthropic API proxy requests
 */
async function handleAnthropicProxy(request, env) {
  try {
    // Parse the incoming request body
    const body = await request.json();

    // Make the request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    // Get the response data
    const data = await response.json();

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Proxy error: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }
}

/**
 * Search YouTube for relevant educational videos
 * Filters for short/medium duration, high relevance, and safe content
 */
async function handleVideoSearch(request, env) {
  try {
    // Check if YouTube API key is configured
    if (!env.YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({
        error: 'YouTube API key not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // Parse the search query from request body
    const body = await request.json();
    const query = body.query;

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({
        error: 'Invalid or missing query parameter'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // Build YouTube API search URL
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoDuration: 'medium', // 4-20 minutes (targets educational content under 10 min)
      order: 'relevance', // Most relevant to the query
      safeSearch: 'strict', // Family-friendly content only
      maxResults: '3', // Get top 3 to have fallback options
      key: env.YOUTUBE_API_KEY
    });

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;

    // Call YouTube Data API
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return new Response(JSON.stringify({
        error: `YouTube API error: ${data.error.message}`
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // Check if we got any results
    if (!data.items || data.items.length === 0) {
      return new Response(JSON.stringify({
        error: 'No videos found for query',
        query: query
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // Get the first video result
    const video = data.items[0];
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const channelTitle = video.snippet.channelTitle;
    const description = video.snippet.description;

    // Return video information
    return new Response(JSON.stringify({
      videoId: videoId,
      title: title,
      channelTitle: channelTitle,
      description: description,
      url: `https://www.youtube.com/watch?v=${videoId}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });

  } catch (error) {
    console.error('Video search error:', error);
    return new Response(JSON.stringify({
      error: 'Video search error: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }
}

// CORS headers configuration
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Allow all origins (or specify your GitHub Pages URL)
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Handle CORS preflight
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
