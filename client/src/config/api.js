const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api';  // Changed from /.netlify/functions/api to /api

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_URL);

export default API_URL;