/**
 * Register Page
 * Handles user registration functionality
 */

import { register, redirectIfAuthenticated } from '../services/auth.service.js';
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

// Get form elements
const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const roleSelect = document.getElementById('role');
const termsCheckbox = document.getElementById('terms');

// Form validation on blur
nameInput?.addEventListener('blur', () => {
  const name = nameInput.value.trim();

  if (!name) {
    showFieldError('name', 'Name is required');
  } else if (name.length < 2) {
    showFieldError('name', 'Name must be at least 2 characters');
  } else {
    clearFieldError('name');
  }
});

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
  const validation = validatePassword(password);

  if (!validation.valid) {
    showFieldError('password', validation.message);
  } else {
    clearFieldError('password');
  }
});

confirmPasswordInput?.addEventListener('blur', () => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!confirmPassword) {
    showFieldError('confirm-password', 'Please confirm your password');
  } else if (password !== confirmPassword) {
    showFieldError('confirm-password', 'Passwords do not match');
  } else {
    clearFieldError('confirm-password');
  }
});

roleSelect?.addEventListener('blur', () => {
  const role = roleSelect.value;

  if (!role) {
    showFieldError('role', 'Please select an account type');
  } else {
    clearFieldError('role');
  }
});

// Clear errors on input
nameInput?.addEventListener('input', () => clearFieldError('name'));
emailInput?.addEventListener('input', () => clearFieldError('email'));
passwordInput?.addEventListener('input', () => clearFieldError('password'));
confirmPasswordInput?.addEventListener('input', () => clearFieldError('confirm-password'));
roleSelect?.addEventListener('change', () => clearFieldError('role'));
termsCheckbox?.addEventListener('change', () => clearFieldError('terms'));

// Handle form submission
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  clearAllErrors(registerForm);
  clearFormMessage('form-message');

  // Get form values
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const role = roleSelect.value;
  const terms = termsCheckbox?.checked || false;

  // Validate inputs
  let hasErrors = false;

  if (!name) {
    showFieldError('name', 'Name is required');
    hasErrors = true;
  } else if (name.length < 2) {
    showFieldError('name', 'Name must be at least 2 characters');
    hasErrors = true;
  }

  if (!email) {
    showFieldError('email', 'Email is required');
    hasErrors = true;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Please enter a valid email address');
    hasErrors = true;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    showFieldError('password', passwordValidation.message);
    hasErrors = true;
  }

  if (!confirmPassword) {
    showFieldError('confirm-password', 'Please confirm your password');
    hasErrors = true;
  } else if (password !== confirmPassword) {
    showFieldError('confirm-password', 'Passwords do not match');
    hasErrors = true;
  }

  if (!role) {
    showFieldError('role', 'Please select an account type');
    hasErrors = true;
  }

  if (!terms) {
    showFieldError('terms', 'You must agree to the terms and conditions');
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  // Get submit button
  const submitButton = registerForm.querySelector('button[type="submit"]');

  try {
    // Disable submit button
    disableSubmitButton(submitButton, 'Creating account...');

    // Call register API
    const response = await register({
      name,
      email,
      password,
      role,
    });

    if (response.success) {
      showFormMessage('form-message', 'Registration successful! Redirecting...', 'success');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Registration error:', error);

    // Show error message
    let errorMessage = 'Registration failed. Please try again.';

    if (error.status === 400) {
      if (error.message.includes('email')) {
        errorMessage = 'Email is already registered';
        showFieldError('email', 'This email is already registered');
      } else {
        errorMessage = error.message;
      }
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

console.log('Register page initialized');
