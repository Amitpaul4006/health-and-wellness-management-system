
import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-domain.vercel.app/api'
  : 'http://localhost:5000/api';

const api = axios.create({ baseURL });

export default api;