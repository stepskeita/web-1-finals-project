/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds

  endpoints: {
    // Auth endpoints
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      me: '/auth/me',
    },

    // User endpoints
    users: {
      base: '/users',
      byId: (id) => `/users/${id}`,
    },

    // Product endpoints
    products: {
      getAll: '/products',
      base: '/products',
      getById: '/products/:id',
      byId: (id) => `/products/${id}`,
      byCategory: (category) => `/products/category/${category}`,
      updateStock: (id) => `/products/${id}/stock`,
      create: '/products',
      update: '/products/:id',
      delete: '/products/:id',
    },

    // Market endpoints
    markets: {
      getAll: '/markets',
      base: '/markets',
      getById: '/markets/:id',
      byId: (id) => `/markets/${id}`,
      byCity: (city) => `/markets/city/${city}`,
      byType: (type) => `/markets/type/${type}`,
      products: (id) => `/markets/${id}/products`,
      removeProduct: (id, productId) => `/markets/${id}/products/${productId}`,
      create: '/markets',
      update: '/markets/:id',
      delete: '/markets/:id',
    },

    // Price submission endpoints
    priceSubmissions: {
      getAll: '/price-submissions',
      getById: '/price-submissions/:id',
      create: '/price-submissions',
      update: '/price-submissions/:id',
      delete: '/price-submissions/:id',
      verify: '/price-submissions/:id/verify',
      reject: '/price-submissions/:id/reject',
      byProduct: '/price-submissions/product/:productId',
      byMarket: '/price-submissions/market/:marketId',
      history: '/price-submissions/product/:productId/market/:marketId/history',
      average: '/price-submissions/product/:productId/average',
    },
  },
};

/**
 * Build full URL for an endpoint
 * @param {string} endpoint - The API endpoint path
 * @returns {string} Full URL
 */
export const buildURL = (endpoint) => {
  return `${apiConfig.baseURL}${endpoint}`;
};

/**
 * Get authorization header
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Export for easy access
export default apiConfig;
