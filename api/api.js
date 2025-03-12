const serverless = require('serverless-http');
const app = require('./server');

console.log('API Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  isServerless: !!process.env.NETLIFY
});

// Add logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    isServerless: !!process.env.NETLIFY,
    timestamp: new Date().toISOString()
  });
  next();
});

// Wrap app with serverless handler
const handler = serverless(app);

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
