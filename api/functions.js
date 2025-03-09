const serverless = require('serverless-http');
const app = require('./server');

// Create handler with custom configuration
const handler = serverless(app, {
  basePath: ''
});

exports.handler = async (event, context) => {
  console.log('Request details:', {
    path: event.path,
    method: event.httpMethod,
    body: event.body
  });

  // Remove function path prefix
  event.path = event.path.replace('/.netlify/functions/api', '');
  
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
    return {
      ...result,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Content-Type': 'application/json',
        ...result.headers
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
