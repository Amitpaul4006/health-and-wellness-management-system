import axios from 'axios';

// API URL with proper environment handling
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://managementhealthandwellness.netlify.app/.netlify/functions/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: process.env.NODE_ENV === 'production' ? 10000 : 30000,
  headers: { 'Content-Type': 'application/json' }
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

export default api;