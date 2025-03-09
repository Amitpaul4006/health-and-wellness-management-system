const serverless = require('serverless-http');
const app = require('./server');

// Create serverless handler with custom configuration
const handler = serverless(app, {
  basePath: ''
});

exports.handler = async (event, context) => {
  // Debug logging
  console.log('Incoming request:', {
    path: event.path,
    method: event.httpMethod,
    body: event.body
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      }
    };
  }

  try {
    // Clean path - remove Netlify Functions prefix
    if (event.path.startsWith('/.netlify/functions/api')) {
      event.path = event.path.replace('/.netlify/functions/api', '');
    }

    console.log('Processing request:', {
      originalPath: event.path,
      method: event.httpMethod
    });

    // Process request through Express app
    const response = await handler(event, context);

    // Add CORS headers to all responses
    return {
      ...response,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Content-Type': 'application/json',
        ...response.headers
      }
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        path: event.path 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
