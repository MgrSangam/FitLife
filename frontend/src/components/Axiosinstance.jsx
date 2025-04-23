import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/'

const AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout : 10000,
  headers:{
    "Content-Type": "application/json",
    accept: "application/json"
  }

});

// Request interceptor for auth token
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);


export default AxiosInstance