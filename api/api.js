const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app, {
  basePath: '',
  request: (req, event, context) => {
    // Debug path handling
    console.log('Raw path:', event.path);
    console.log('Raw method:', event.httpMethod);
    console.log('Raw body:', event.body);

    // Remove Netlify Function path prefix if present
    if (event.path.startsWith('/.netlify/functions/api')) {
      event.path = event.path.replace('/.netlify/functions/api', '');
    }

    console.log('Processed path:', event.path);
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
    console.log('Handler response:', response);

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
