/**
 * Auth Initialization Utility
 * Handles authentication state on page load
 */

import { isAuthenticated, getUser, logout, getCurrentUser } from '../services/auth.service.js';

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token) return true;

  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

/**
 * Initialize auth state on page load
 * Validates token and refreshes user data
 */
export async function initializeAuth() {
  if (!isAuthenticated()) {
    return null;
  }

  const token = localStorage.getItem('token');

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token expired, logging out...');
    logout();
    return null;
  }

  try {
    // Refresh user data from server
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    // If token is invalid, logout
    if (error.status === 401) {
      logout();
    }
    return null;
  }
}

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Milliseconds until expiration
 */
export function getTokenExpirationTime(token) {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    return Math.max(0, expirationTime - currentTime);
  } catch (error) {
    return 0;
  }
}

/**
 * Setup token expiration warning
 * Warns user before token expires
 */
export function setupTokenExpirationWarning() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const timeUntilExpiration = getTokenExpirationTime(token);

  // Warn 5 minutes before expiration
  const warningTime = timeUntilExpiration - (5 * 60 * 1000);

  if (warningTime > 0) {
    setTimeout(() => {
      const shouldRefresh = confirm(
        'Your session is about to expire. Would you like to stay logged in?'
      );

      if (shouldRefresh) {
        // Refresh user data to get new token if backend supports it
        getCurrentUser().catch(() => {
          alert('Session expired. Please login again.');
          logout();
        });
      }
    }, warningTime);
  }

  // Auto-logout when token expires
  if (timeUntilExpiration > 0) {
    setTimeout(() => {
      alert('Your session has expired. Please login again.');
      logout();
    }, timeUntilExpiration);
  }
}

/**
 * Display user info in navigation
 * @param {string} elementId - ID of element to populate
 */
export function displayUserInfo(elementId = 'user-info') {
  const user = getUser();
  const element = document.getElementById(elementId);

  if (user && element) {
    element.innerHTML = `
      <span class="user-name">${user.name}</span>
      <span class="user-role">${user.role}</span>
    `;
  }
}

export default {
  initializeAuth,
  isTokenExpired,
  getTokenExpirationTime,
  setupTokenExpirationWarning,
  displayUserInfo,
};
