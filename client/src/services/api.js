import axios from 'axios';
import configuredApi, { API_URL } from '../config/api';

// Use the configured api instance from config/api.js
const api = configuredApi;

// Service exports using the imported api instance
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const medicationService = {
  getAll: () => api.get('/medications'),
  add: (data) => api.post('/medications/add', data),
  updateStatus: (id, status) => api.patch(`/medications/${id}/status`, { status }),
  getReminders: () => api.get('/medications/reminders'),
  markDone: (id) => api.patch(`/medications/${id}/done`)
};

export const reportService = {
  generate: () => api.post('/reports/generate'),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly')
};

// Export API_URL and configured api instance
export { API_URL };
export default api;
