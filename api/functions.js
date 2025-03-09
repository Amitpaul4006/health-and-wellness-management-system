const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app);

exports.handler = async (event, context) => {
  // Debug logging
  console.log('Original path:', event.path);
  console.log('HTTP method:', event.httpMethod);
  console.log('Headers:', event.headers);

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

  // Clean path
  const cleanPath = event.path
    .replace('/.netlify/functions/api', '')
    .replace('/api', '') || '/';
  
  event.path = cleanPath;
  console.log('Cleaned path:', cleanPath);

  try {
    const response = await handler(event, context);
    console.log('Response:', response);
    return {
      ...response,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Content-Type': 'application/json',
        ...response.headers,
      }
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
