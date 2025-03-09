const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app, {
  basePath: '' // Important: This ensures paths are handled correctly
});

exports.handler = async (event, context) => {
  console.log('Raw event:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  });

  // Clean up the path - this is crucial
  if (event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '');
  }

  console.log('Processed path:', event.path);

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
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
