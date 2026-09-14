import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Auth-Token'] = token;
    
    // Ultimate fallback for strict shared hosting (sends token in URL)
    config.params = { ...config.params, token };
  }
  return config;
});

export default axiosClient;
