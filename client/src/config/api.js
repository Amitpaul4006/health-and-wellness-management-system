const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api';

console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

export default API_URL;