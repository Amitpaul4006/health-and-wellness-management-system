const serverless = require('serverless-http');
const app = require('./server');

// Add environment logging
console.log('API Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
console.log('Email Config:', process.env.EMAIL_USER ? 'Available' : 'Missing');

// Update email handling for serverless
app.use((req, res, next) => {
  req.isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;
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
    console.log('POST /generate endpoint hit');
    console.log('User ID:', req.user.id);
    
    const { generateReport } = require('./services/reportService');
    const result = await generateReport(req.user.id, req.user.email);
    
    res.json(result);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      details: error.message 
    });
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
