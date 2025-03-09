import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Debug interceptor
api.interceptors.request.use(config => {
  console.log('Request:', config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Service exports
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const medicationService = {
  getAll: () => api.get('/medications'),
  add: (data) => api.post('/medications/add', data),
  updateStatus: (id, status) => api.patch(`/medications/${id}/status`, { status })
};

export const reportService = {
  generate: () => api.post('/reports/generate')
};

export default api;
