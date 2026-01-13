/**
 * API Service Module
 * Handles all HTTP requests to the backend API
 */

import { apiConfig, buildURL, getAuthHeader } from '../config/api.config.js';

/**
 * Make an HTTP request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function request(endpoint, options = {}) {
  const url = buildURL(endpoint);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error?.message || data.error || 'Request failed',
        data: data
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error. Please check your connection.',
      data: null
    };
  }
}

/**
 * GET request
 */
export async function get(endpoint, options = {}) {
  return request(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request
 */
export async function post(endpoint, data, options = {}) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT request
 */
export async function put(endpoint, data, options = {}) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PATCH request
 */
export async function patch(endpoint, data, options = {}) {
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE request
 */
export async function del(endpoint, options = {}) {
  return request(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Make authenticated request
 */
export async function authenticatedRequest(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  authenticated: authenticatedRequest,
};
