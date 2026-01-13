/**
 * Product Service
 * Handles product-related API calls
 */

import { authenticatedRequest } from './api.service.js';
import { apiConfig } from '../config/api.config.js';

/**
 * Get all products with optional filters
 * @param {Object} params - Query parameters (category, search, page, limit)
 * @returns {Promise<Object>} Products data
 */
export async function getProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `${apiConfig.endpoints.products.getAll}?${queryString}`
    : apiConfig.endpoints.products.getAll;

  return authenticatedRequest(endpoint, { method: 'GET' });
}

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 */
export async function getProductById(id) {
  return authenticatedRequest(
    apiConfig.endpoints.products.byId(id),
    { method: 'GET' }
  );
}

/**
 * Create new product (admin only)
 * @param {Object} productData - Product information
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(productData) {
  return authenticatedRequest(apiConfig.endpoints.products.create, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

/**
 * Update product (admin only)
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product information
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, productData) {
  return authenticatedRequest(
    `/products/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(productData),
    }
  );
}

/**
 * Delete product (admin only)
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteProduct(id) {
  return authenticatedRequest(
    `/products/${id}`,
    { method: 'DELETE' }
  );
}

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
