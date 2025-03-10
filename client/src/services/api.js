import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// All operations use this configured api instance:
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const medicationService = {
  getAll: () => api.get('/medications'),
  add: (data) => api.post('/medications/add', data),
  updateStatus: (id, status) => api.patch(`/medications/${id}/status`, { status }),
  getReminders: () => api.get('/medications/reminders'),
  markDone: (id) => api.patch(`/medications/${id}/done`),
  updateReminder: (id, data) => api.put(`/medications/${id}/reminder`, data)
};

export const reportService = {
  generate: () => api.post('/reports/generate'),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly')
};

export default api;
