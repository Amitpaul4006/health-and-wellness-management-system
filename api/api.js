const serverless = require('serverless-http');
const app = require('./server');
const authRoutes = require('./routes/auth');

// Log environment
console.log('API Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  isServerless: true
});

// Mount auth routes directly
app.post('/auth/login', authRoutes.handlers.login);
app.post('/auth/register', authRoutes.handlers.register);
app.post('/auth/logout', authRoutes.handlers.logout);

// Request logging
app.use((req, res, next) => {
  console.log('Request:', {
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
