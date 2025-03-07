import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL  // Use full URL instead of relative path
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const formattedData = {
        name: userData.name,
        email: userData.username, // Using email from username field
        username: userData.username, // Add username field
        password: userData.password
      };
      
      const response = await api.post('/auth/register', formattedData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const medicationService = {
  fetchMedications: async () => {
    try {
      console.log('Fetching medications from:', `${API_URL}/medications`);
      const response = await api.get('/medications');
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  addMedication: async (medicationData) => {
    try {
      console.log('Received medication data:', medicationData);
      
      const { name, type, description, schedule, selectedDay } = medicationData;
      
      const formattedData = {
        name,
        type,
        description,
        date: schedule?.startDate,
        time: schedule?.time,
        weekDay: type === 'weekly' ? selectedDay : undefined
      };

      console.log('Sending formatted medication data:', formattedData);
      const response = await api.post('/medications/add', formattedData);
      return response.data;
    } catch (error) {
      console.error('API Error:', {
        originalData: medicationData,
        error: error.response?.data || error.message
      });
      throw error.response?.data || error;
    }
  }
  // ...other methods...
};

export default api;
