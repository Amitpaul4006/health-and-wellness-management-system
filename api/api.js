const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app, {
  basePath: '',
  request: (req, event) => {
    // Add original path for debugging
    req.originalPath = event.path;
    return req;
  }
});

// Wrap handler to catch all errors
const wrappedHandler = async (event, context) => {
  console.log('Function invoked:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
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
    const result = await handler(event, context);
    
    // Add CORS and content headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Content-Type': 'application/json',
      ...result.headers
    };

    return { ...result, headers };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};

exports.handler = wrappedHandler;
