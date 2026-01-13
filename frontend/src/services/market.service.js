/**
 * Market Service
 * Handles market-related API calls
 */

import { authenticatedRequest } from './api.service.js';
import { apiConfig } from '../config/api.config.js';

/**
 * Get all markets with optional filters
 * @param {Object} params - Query parameters (city, state, page, limit)
 * @returns {Promise<Object>} Markets data
 */
export async function getMarkets(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `${apiConfig.endpoints.markets.getAll}?${queryString}`
    : apiConfig.endpoints.markets.getAll;

  return authenticatedRequest(endpoint, { method: 'GET' });
}

/**
 * Get market by ID
 * @param {string} id - Market ID
 * @returns {Promise<Object>} Market data
 */
export async function getMarketById(id) {
  return authenticatedRequest(
    apiConfig.endpoints.markets.byId(id),
    { method: 'GET' }
  );
}

/**
 * Create new market (admin only)
 * @param {Object} marketData - Market information
 * @returns {Promise<Object>} Created market
 */
export async function createMarket(marketData) {
  return authenticatedRequest(apiConfig.endpoints.markets.create, {
    method: 'POST',
    body: JSON.stringify(marketData),
  });
}

/**
 * Update market (admin only)
 * @param {string} id - Market ID
 * @param {Object} marketData - Updated market information
 * @returns {Promise<Object>} Updated market
 */
export async function updateMarket(id, marketData) {
  return authenticatedRequest(
    `/markets/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(marketData),
    }
  );
}

/**
 * Delete market (admin only)
 * @param {string} id - Market ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteMarket(id) {
  return authenticatedRequest(
    `/markets/${id}`,
    { method: 'DELETE' }
  );
}

export default {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
};
