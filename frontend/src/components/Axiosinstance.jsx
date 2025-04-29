import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/';

const AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// Request interceptor
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Don't set Content-Type for FormData - let the browser set it automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AxiosInstance;