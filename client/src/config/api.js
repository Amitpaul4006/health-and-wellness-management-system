import axios from 'axios';

// Fix base URL formatting
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://managementhealthandwellness.netlify.app'
  : 'http://localhost:5000';

const API_PATH = process.env.NODE_ENV === 'production'
  ? '/.netlify/functions/api'
  : '/api';

const api = axios.create({
  baseURL: `${BASE_URL}${API_PATH}`,
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

export const API_URL = `${BASE_URL}${API_PATH}`;
export default api;