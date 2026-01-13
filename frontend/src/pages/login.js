/**
 * Login Page
 * Handles user login functionality
 */

import { login, redirectIfAuthenticated } from '../services/auth.service.js';
import { isTokenExpired } from '../utils/auth-init.js';
import { initNavbar } from '../components/navbar.js';
import {
  isValidEmail,
  validatePassword,
  showFieldError,
  clearFieldError,
  clearAllErrors,
  showFormMessage,
  clearFormMessage,
  disableSubmitButton,
  enableSubmitButton,
} from '../utils/validation.js';

// Initialize navbar
initNavbar();

// Redirect if already authenticated
redirectIfAuthenticated();

// Check for expired token and clean up
const token = localStorage.getItem('token');
if (token && isTokenExpired(token)) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showFormMessage('form-message', 'Your session has expired. Please login again.', 'error');
}

// Get form elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');

// Form validation on input
emailInput?.addEventListener('blur', () => {
  const email = emailInput.value.trim();

  if (!email) {
    showFieldError('email', 'Email is required');
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Please enter a valid email address');
  } else {
    clearFieldError('email');
  }
});

passwordInput?.addEventListener('blur', () => {
  const password = passwordInput.value;

  if (!password) {
    showFieldError('password', 'Password is required');
  } else {
    clearFieldError('password');
  }
});

// Clear errors on input
emailInput?.addEventListener('input', () => clearFieldError('email'));
passwordInput?.addEventListener('input', () => clearFieldError('password'));

// Handle form submission
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  clearAllErrors(loginForm);
  clearFormMessage('form-message');

  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const remember = rememberCheckbox?.checked || false;

  // Validate inputs
  let hasErrors = false;

  if (!email) {
    showFieldError('email', 'Email is required');
    hasErrors = true;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Please enter a valid email address');
    hasErrors = true;
  }

  if (!password) {
    showFieldError('password', 'Password is required');
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  // Get submit button
  const submitButton = loginForm.querySelector('button[type="submit"]');

  try {
    // Disable submit button
    disableSubmitButton(submitButton, 'Logging in...');

    // Call login API
    const response = await login({ email, password });

    if (response.success) {
      showFormMessage('form-message', 'Login successful! Redirecting...', 'success');

      // Store remember me preference
      if (remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Login error:', error);

    // Show error message
    let errorMessage = 'Login failed. Please try again.';

    if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showFormMessage('form-message', errorMessage, 'error');

    // Re-enable submit button
    enableSubmitButton(submitButton);
  }
});

console.log('Login page initialized');
