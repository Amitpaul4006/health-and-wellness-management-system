const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'  // Use full Netlify Functions path
  : 'http://localhost:5000/api';

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_URL);

export default API_URL;