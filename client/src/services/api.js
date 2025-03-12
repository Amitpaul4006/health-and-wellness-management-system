import api from '../config/api';  // Only import the default api instance

// Service exports
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const medicationService = {
  getAll: () => {
    console.log('Fetching medications with token:', localStorage.getItem('token'));
    return api.get('/medications');
  },
  add: (data) => {
    console.log('Adding medication:', data);
    return api.post('/medications/add', {
      ...data,
      scheduledDate: `${data.date}T${data.time}`
    });
  },
  updateStatus: (id, status) => api.patch(`/medications/${id}/status`, { status }),
  getReminders: () => api.get('/medications/reminders'),
  markDone: (id) => api.patch(`/medications/${id}/done`)
};

export const reportService = {
  generate: () => api.post('/reports/generate'),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly')
};

export default api;
