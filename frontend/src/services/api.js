import axios from 'axios';

VITE_API_URL = import.meta.env.VITE_API_URL;

// Base URL from .env
const API_BASE_URL = VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor (dev logging)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new Error(error.response.data.error || error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('Network error: Could not connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const productAPI = {
  scanProduct: (url) => api.post('/products/scan', { url }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  getAllProducts: () => api.get('/products'),
};

export const complianceAPI = {
  scanCompliance: (productId) => api.post(`/compliance/scan/${productId}`),
  getReport: () => api.get('/compliance/report'),
};

export const scrapeAPI = {
  testScrape: (url) => api.post('/scrape/test', { url }),
};

export default api;
