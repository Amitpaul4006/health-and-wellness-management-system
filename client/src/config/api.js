const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'    // All deployed env calls
  : 'http://localhost:5000/api'; // All local development calls

console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

export default API_URL;