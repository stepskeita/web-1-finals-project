/**
 * Price Submission Page
 * Form for submitting new price data
 */

import { requireAuth, getUser } from '../services/auth.service.js';
import { initializeAuth, setupTokenExpirationWarning } from '../utils/auth-init.js';
import { initNavbar } from '../components/navbar.js';
import { getProducts } from '../services/product.service.js';
import { getMarkets } from '../services/market.service.js';
import { createPriceSubmission } from '../services/price-submission.service.js';
import {
  showFieldError,
  clearFieldError,
  clearAllErrors,
  showFormMessage,
  clearFormMessage,
  disableSubmitButton,
  enableSubmitButton,
} from '../utils/validation.js';

// Protect this page - require authentication
requireAuth();

// Initialize authentication state
initializeAuth().then(user => {
  if (user) {
    console.log('Price submission page loaded for user:', user.name);
    initializePage();
  }
});

// Setup token expiration warning
setupTokenExpirationWarning();

// Initialize navigation bar
initNavbar();

// Form elements
let productSelect;
let marketSelect;
let priceInput;
let unitInput;
let dateInput;
let notesField;
let submitButton;
let priceForm;

/**
 * Initialize page and load data
 */
async function initializePage() {
  // Get form elements
  productSelect = document.getElementById('product');
  marketSelect = document.getElementById('market');
  priceInput = document.getElementById('price');
  unitInput = document.getElementById('unit');
  dateInput = document.getElementById('date');
  notesField = document.getElementById('notes');
  priceForm = document.getElementById('price-submission-form');
  submitButton = priceForm?.querySelector('button[type="submit"]');

  // Set default date to today
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Load products and markets
  await Promise.all([
    loadProducts(),
    loadMarkets(),
  ]);

  // Setup form validation
  setupFormValidation();

  // Setup form submission
  setupFormSubmission();

  // Setup reset button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the form?')) {
      resetForm();
      clearFormMessage('form-message');
    }
  });

  // Setup character counter for notes
  setupNotesCounter();
}

/**
 * Load products from API
 */
async function loadProducts() {
  try {
    showLoading(productSelect, 'Loading products...');

    const response = await getProducts({ limit: 1000, sort: 'name' });
    const products = response.data?.products || response.data || [];

    if (products.length === 0) {
      productSelect.innerHTML = '<option value="">No products available</option>';
      return;
    }

    // Populate select options
    const options = products.map(product =>
      `<option value="${product._id}">${product.name}${product.category ? ` - ${product.category}` : ''}</option>`
    ).join('');

    productSelect.innerHTML = `
      <option value="">Select a product</option>
      ${options}
    `;

    // Enable the select
    productSelect.disabled = false;

  } catch (error) {
    console.error('Error loading products:', error);
    productSelect.innerHTML = '<option value="">Error loading products</option>';
    showFieldError('product', 'Failed to load products. Please refresh the page.');
  }
}

/**
 * Load markets from API
 */
async function loadMarkets() {
  try {
    showLoading(marketSelect, 'Loading markets...');

    const response = await getMarkets({ limit: 1000, sort: 'name' });
    const markets = response.data?.markets || response.data || [];

    if (markets.length === 0) {
      marketSelect.innerHTML = '<option value="">No markets available</option>';
      return;
    }

    // Populate select options
    const options = markets.map(market => {
      const location = market.address ? `, ${market.address.city}` : '';
      return `<option value="${market._id}">${market.name}${location}</option>`;
    }).join('');

    marketSelect.innerHTML = `
      <option value="">Select a market</option>
      ${options}
    `;

    // Enable the select
    marketSelect.disabled = false;

  } catch (error) {
    console.error('Error loading markets:', error);
    marketSelect.innerHTML = '<option value="">Error loading markets</option>';
    showFieldError('market', 'Failed to load markets. Please refresh the page.');
  }
}

/**
 * Show loading state in select
 */
function showLoading(selectElement, message) {
  if (selectElement) {
    selectElement.innerHTML = `<option value="">${message}</option>`;
    selectElement.disabled = true;
  }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  // Product validation
  productSelect?.addEventListener('change', () => {
    if (!productSelect.value) {
      showFieldError('product', 'Please select a product');
    } else {
      clearFieldError('product');
    }
  });

  // Market validation
  marketSelect?.addEventListener('change', () => {
    if (!marketSelect.value) {
      showFieldError('market', 'Please select a market');
    } else {
      clearFieldError('market');
    }
  });

  // Price validation
  priceInput?.addEventListener('blur', () => {
    const price = parseFloat(priceInput.value);

    if (!priceInput.value) {
      showFieldError('price', 'Price is required');
    } else if (isNaN(price) || price <= 0) {
      showFieldError('price', 'Please enter a valid price greater than 0');
    } else {
      clearFieldError('price');
    }
  });

  priceInput?.addEventListener('input', () => clearFieldError('price'));

  // Unit validation
  unitInput?.addEventListener('change', () => {
    if (!unitInput.value) {
      showFieldError('unit', 'Please select a unit');
    } else {
      clearFieldError('unit');
    }
  });

  // Date validation
  dateInput?.addEventListener('blur', () => {
    if (!dateInput.value) {
      showFieldError('date', 'Date is required');
    } else {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        showFieldError('date', 'Date cannot be in the future');
      } else {
        clearFieldError('date');
      }
    }
  });

  dateInput?.addEventListener('input', () => clearFieldError('date'));
}

/**
 * Setup notes character counter
 */
function setupNotesCounter() {
  const notesCount = document.getElementById('notes-count');

  if (notesField && notesCount) {
    notesField.addEventListener('input', (e) => {
      notesCount.textContent = e.target.value.length;
    });
  }
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
  priceForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearAllErrors(priceForm);
    clearFormMessage('form-message');

    // Get form values
    const formData = {
      product: productSelect.value,
      market: marketSelect.value,
      price: parseFloat(priceInput.value),
      unit: unitInput.value.trim(),
      date: dateInput.value,
      notes: notesField.value.trim(),
    };

    // Validate form
    let hasErrors = false;

    if (!formData.product) {
      showFieldError('product', 'Please select a product');
      hasErrors = true;
    }

    if (!formData.market) {
      showFieldError('market', 'Please select a market');
      hasErrors = true;
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      showFieldError('price', 'Please enter a valid price greater than 0');
      hasErrors = true;
    }

    if (!formData.unit) {
      showFieldError('unit', 'Please select a unit');
      hasErrors = true;
    }

    if (!formData.date) {
      showFieldError('date', 'Please select a date');
      hasErrors = true;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        showFieldError('date', 'Date cannot be in the future');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      showFormMessage('form-message', 'Please fix the errors above', 'error');
      return;
    }

    // Submit form
    try {
      disableSubmitButton(submitButton, 'Submitting...');

      const response = await createPriceSubmission(formData);

      if (response.success) {
        showFormMessage('form-message', 'Price submitted successfully!', 'success');

        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          clearFormMessage('form-message');
        }, 2000);
      }

    } catch (error) {
      console.error('Error submitting price:', error);

      let errorMessage = 'Failed to submit price. Please try again.';

      if (error.status === 400) {
        errorMessage = error.message || 'Invalid data. Please check your inputs.';
      } else if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.status === 404) {
        errorMessage = 'Product or market not found.';
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      }

      showFormMessage('form-message', errorMessage, 'error');
      enableSubmitButton(submitButton);
    }
  });
}

/**
 * Reset form to initial state
 */
function resetForm() {
  if (priceForm) {
    priceForm.reset();
  }

  // Reset date to today
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Reset notes counter
  const notesCount = document.getElementById('notes-count');
  if (notesCount) {
    notesCount.textContent = '0';
  }

  // Re-enable submit button
  if (submitButton) {
    enableSubmitButton(submitButton);
  }

  // Clear all errors
  if (priceForm) {
    clearAllErrors(priceForm);
  }
}

console.log('Price submission page initialized');

if (notesField && notesCount) {
  notesField.addEventListener('input', (e) => {
    notesCount.textContent = e.target.value.length;
  });
}

// Set today's date as default
const dateField = document.getElementById('date');
if (dateField) {
  dateField.valueAsDate = new Date();
}
