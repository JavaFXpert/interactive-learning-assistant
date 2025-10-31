/**
 * Cloudflare Worker - Anthropic API Proxy
 *
 * This worker acts as a proxy between your GitHub Pages frontend and the Anthropic API.
 * It handles CORS and securely manages your API key.
 *
 * Deploy this to Cloudflare Workers and set your ANTHROPIC_API_KEY in the environment variables.
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

    try {
      // Parse the incoming request body
      const body = await request.json();

      // Make the request to Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY, // Access from environment
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
};

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
