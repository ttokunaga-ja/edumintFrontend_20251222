import axios from 'axios';

const getApiBaseUrl = () => {
  try {
    if (
      typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_API_BASE_URL
    ) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // import.meta is not available in this environment
  }
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
