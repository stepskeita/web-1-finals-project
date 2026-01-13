/**
 * Authentication Service
 * Handles user authentication, token management, and user session
 */

import { apiConfig } from '../config/api.config.js';
import { post, authenticatedRequest } from './api.service.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response with user data and token
 */
export async function register(userData) {
  try {
    const response = await post(apiConfig.endpoints.auth.register, userData);

    if (response.success && response.data) {
      // Store token and user data
      setToken(response.data.token);
      setUser(response.data.user);

      return response;
    }

    throw new Error('Registration failed');
  } catch (error) {
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} Response with user data and token
 */
export async function login(credentials) {
  try {
    const response = await post(apiConfig.endpoints.auth.login, credentials);

    if (response.success && response.data) {
      // Store token and user data
      setToken(response.data.token);
      setUser(response.data.user);

      return response;
    }

    throw new Error('Login failed');
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user
 */
export function logout() {
  removeToken();
  removeUser();
  window.location.href = '/login.html';
}

/**
 * Get current user
 * @returns {Promise<Object>} Current user data
 */
export async function getCurrentUser() {
  try {
    const response = await authenticatedRequest(apiConfig.endpoints.auth.me, {
      method: 'GET',
    });

    if (response.success && response.data) {
      setUser(response.data);
      return response.data;
    }

    throw new Error('Failed to get user data');
  } catch (error) {
    // If unauthorized, logout
    if (error.status === 401) {
      logout();
    }
    throw error;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Store token in localStorage
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Store user data in localStorage
 * @param {Object} user
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 * @returns {Object|null}
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Remove user data from localStorage
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(role) {
  const user = getUser();
  return user && user.role === role;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect to dashboard if already authenticated
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return true;
  }
  return false;
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  setToken,
  getUser,
  setUser,
  hasRole,
  isAdmin,
  requireAuth,
  redirectIfAuthenticated,
};
