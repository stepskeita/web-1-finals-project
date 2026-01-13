/**
 * Form Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  return { valid: true, message: '' };
}

/**
 * Show error message on form field
 * @param {string} fieldId - Input field ID
 * @param {string} message - Error message
 */
export function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.add('error');
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * Clear error message from form field
 * @param {string} fieldId - Input field ID
 */
export function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.remove('error');
  }

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

/**
 * Clear all form errors
 * @param {HTMLFormElement} form
 */
export function clearAllErrors(form) {
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });

  const errorFields = form.querySelectorAll('.error');
  errorFields.forEach(field => field.classList.remove('error'));
}

/**
 * Show form message (success or error)
 * @param {string} messageId - Message element ID
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
export function showFormMessage(messageId, message, type = 'error') {
  const messageElement = document.getElementById(messageId);

  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    messageElement.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    }
  }
}

/**
 * Clear form message
 * @param {string} messageId - Message element ID
 */
export function clearFormMessage(messageId) {
  const messageElement = document.getElementById(messageId);

  if (messageElement) {
    messageElement.textContent = '';
    messageElement.style.display = 'none';
  }
}

/**
 * Disable form submit button
 * @param {HTMLButtonElement} button
 * @param {string} loadingText
 */
export function disableSubmitButton(button, loadingText = 'Loading...') {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = loadingText;
}

/**
 * Enable form submit button
 * @param {HTMLButtonElement} button
 */
export function enableSubmitButton(button) {
  button.disabled = false;
  button.textContent = button.dataset.originalText || 'Submit';
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
}

export default {
  isValidEmail,
  validatePassword,
  showFieldError,
  clearFieldError,
  clearAllErrors,
  showFormMessage,
  clearFormMessage,
  disableSubmitButton,
  enableSubmitButton,
  getFormData,
};
