import axios from 'axios';

// Base URL from .env - fixed for both dev and prod
const API_BASE_URL ="http://localhost:5000/api" || import.meta.env.VITE_API_URL;

console.log('API Base URL:', API_BASE_URL); // Debug log

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
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error occurred';
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error: Could not connect to server. Check your internet connection.');
    } else {
      // Something else happened
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

// Test connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { connected: true, data: response.data };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export default api;