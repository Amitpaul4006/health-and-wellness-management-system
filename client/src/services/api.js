import api from '../config/api';  // Only import the default api instance

// Service exports
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
  generate: async () => {
    const response = await api.post('/reports/generate', {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Report generation response:', response.data);
    return response;
  },
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly')
};

export default api;
