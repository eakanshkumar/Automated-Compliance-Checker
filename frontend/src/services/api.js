import axios from 'axios';

// Use environment variable for production, fallback to proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('Network error: Could not connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Product API methods
export const productAPI = {
  scanProduct: (url) => api.post('/products/scan', { url }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  getAllProducts: () => api.get('/products'),
};

// Compliance API methods
export const complianceAPI = {
  scanCompliance: (productId) => api.post(`/compliance/scan/${productId}`),
  getReport: () => api.get('/compliance/report'),
};

// Scrape API methods
export const scrapeAPI = {
  testScrape: (url) => api.post('/scrape/test', { url }),
};

export default api;