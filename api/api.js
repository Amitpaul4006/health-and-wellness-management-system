const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app, {
  basePath: '',
  request: (req, event, context) => {
    // Clean up path before processing
    const path = event.path.replace('/.netlify/functions/api', '');
    req.url = path;
    req.path = path;
    
    console.log('Processing path:', {
      original: event.path,
      cleaned: path,
      method: event.httpMethod
    });
    
    return req;
  }
});

exports.handler = async (event, context) => {
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
    const response = await handler(event, context);
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
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
