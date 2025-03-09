import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout')
};

export const medicationService = {
  getAll: () => api.get('/medications'),
  add: (data) => api.post('/medications/add', data),
  updateStatus: (id, status) => api.patch(`/medications/${id}/status`, { status }),
  generateReport: () => api.get('/reports/generate')
};

export default api;
