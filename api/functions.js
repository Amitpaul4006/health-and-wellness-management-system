const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app);

exports.handler = async (event, context) => {
  console.log('Function invoked:', event.path, event.httpMethod);
  
  // Clean the path for API routing
  event.path = event.path
    .replace('/.netlify/functions/api', '')
    .replace('/api', '') || '/';
  
  console.log('Cleaned path:', event.path);
  
  const response = await handler(event, context);
  
  response.headers = {
    ...response.headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  };

  return response;
};
