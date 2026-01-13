/**
 * Price Submission Service
 * Handles price submission-related API calls
 */

import { authenticatedRequest } from './api.service.js';
import { apiConfig } from '../config/api.config.js';

/**
 * Get all price submissions with optional filters
 * @param {Object} params - Query parameters (product, market, status, page, limit, sort)
 * @returns {Promise<Object>} Price submissions data
 */
export async function getPriceSubmissions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `${apiConfig.endpoints.priceSubmissions.getAll}?${queryString}`
    : apiConfig.endpoints.priceSubmissions.getAll;

  return authenticatedRequest(endpoint, { method: 'GET' });
}

/**
 * Get price submission by ID
 * @param {string} id - Price submission ID
 * @returns {Promise<Object>} Price submission data
 */
export async function getPriceSubmissionById(id) {
  return authenticatedRequest(
    apiConfig.endpoints.priceSubmissions.getById.replace(':id', id),
    { method: 'GET' }
  );
}

/**
 * Create new price submission
 * @param {Object} submissionData - Price submission information
 * @returns {Promise<Object>} Created price submission
 */
export async function createPriceSubmission(submissionData) {
  return authenticatedRequest(apiConfig.endpoints.priceSubmissions.create, {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
}

/**
 * Update price submission (admin only)
 * @param {string} id - Price submission ID
 * @param {Object} submissionData - Updated submission information
 * @returns {Promise<Object>} Updated price submission
 */
export async function updatePriceSubmission(id, submissionData) {
  return authenticatedRequest(
    apiConfig.endpoints.priceSubmissions.update.replace(':id', id),
    {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    }
  );
}

/**
 * Delete price submission (admin only)
 * @param {string} id - Price submission ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deletePriceSubmission(id) {
  return authenticatedRequest(
    apiConfig.endpoints.priceSubmissions.delete.replace(':id', id),
    { method: 'DELETE' }
  );
}

/**
 * Verify price submission (admin only)
 * @param {string} id - Price submission ID
 * @returns {Promise<Object>} Updated submission
 */
export async function verifyPriceSubmission(id) {
  return authenticatedRequest(
    apiConfig.endpoints.priceSubmissions.verify.replace(':id', id),
    { method: 'PATCH' }
  );
}

/**
 * Reject price submission (admin only)
 * @param {string} id - Price submission ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated submission
 */
export async function rejectPriceSubmission(id, reason) {
  return authenticatedRequest(
    apiConfig.endpoints.priceSubmissions.reject.replace(':id', id),
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }
  );
}

/**
 * Get my price submissions (current user)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} User's price submissions
 */
export async function getMyPriceSubmissions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `${apiConfig.endpoints.priceSubmissions.getAll}?${queryString}`
    : apiConfig.endpoints.priceSubmissions.getAll;

  return authenticatedRequest(endpoint, { method: 'GET' });
}

export default {
  getPriceSubmissions,
  getPriceSubmissionById,
  createPriceSubmission,
  updatePriceSubmission,
  deletePriceSubmission,
  verifyPriceSubmission,
  rejectPriceSubmission,
  getMyPriceSubmissions,
};
