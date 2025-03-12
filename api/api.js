const serverless = require('serverless-http');
const app = require('./server');
const { handlers } = require('./routes/auth');

// Log environment
console.log('API Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  isServerless: true
});

// Mount routes with full paths for serverless
app.post('/.netlify/functions/api/auth/login', handlers.login);
app.post('/.netlify/functions/api/auth/register', handlers.register);
app.post('/.netlify/functions/api/auth/logout', handlers.logout);

// Log requests
app.use((req, res, next) => {
  console.log('Serverless Request:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

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
