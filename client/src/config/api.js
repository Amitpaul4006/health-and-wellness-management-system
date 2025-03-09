const API_URL = process.env.REACT_APP_API_URL || '/.netlify/functions/api';
console.log('Using API URL:', API_URL);

export default API_URL;