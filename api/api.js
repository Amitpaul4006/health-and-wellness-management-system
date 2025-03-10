const serverless = require('serverless-http');
const app = require('./server');
const auth = require('./middleware/auth');  // Fix auth import

// Environment check logging
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

// Update report route
app.post('/reports/generate', auth, async (req, res) => {
  try {
    console.log('Report generation for:', req.user?.id);
    const result = await require('./services/reportService').generateReport(req.user.id, req.user.email);
    res.json(result);
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add auth routes that don't need middleware
app.post('/auth/login', require('./routes/auth').login);
app.post('/auth/register', require('./routes/auth').register);

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
