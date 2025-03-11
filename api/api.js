const serverless = require('serverless-http');
const app = require('./server');

// Environment logging
console.log('API Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  isServerless: !!process.env.NETLIFY,
  hasEmailConfig: !!process.env.EMAIL_USER,
  hasDBConfig: !!process.env.MONGODB_URI,
  functionTimeout: process.env.NETLIFY ? '30s' : 'unlimited'
});

app.use((req, res, next) => {
  req.isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;
  
  // Add request logging
  console.log(`${req.method} ${req.path}`, {
    isServerless: req.isServerless,
    hasAuth: !!req.headers.authorization
  });
  
  next();
});

// Import functions directly
const { login, register } = require('./routes/auth');
const { generateReport } = require('./services/reportService');

// Direct route definitions
app.post('/auth/login', login);
app.post('/auth/register', register);

// Medication routes (protected)
app.use('/medications', require('./routes/medications'));
app.use('/reports', require('./routes/report'));

app.post('/reports/generate', async (req, res) => {
  try {
    const result = await generateReport(req.user?.id, req.user?.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serverless handler
const handler = serverless(app);
exports.handler = async (event, context) => {
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
};
