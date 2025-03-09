const serverless = require('serverless-http');
const app = require('./server');

const handler = serverless(app);

exports.handler = async (event, context) => {
  // Remove any extra path segments
  event.path = event.path.replace('/.netlify/functions', '');
  event.path = event.path.replace('/api', '') || '/';
  
  console.log('Processing request:', event.path);
  
  return await handler(event, context);
};
