import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction 
  ? '/.netlify/functions/api'
  : 'http://localhost:5000/api';

console.log('API Configuration:', {
  environment: process.env.NODE_ENV,
  baseURL,
  isServerless: isProduction
});

const api = axios.create({
  baseURL,
  timeout: isProduction ? 10000 : 30000
});

// Add auth interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.data || error.message);
    throw error;
  }
);

module.exports = api;