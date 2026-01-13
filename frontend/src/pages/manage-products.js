/**
 * Manage Products Page
 * Admin page for CRUD operations on products
 */

import { requireAuth, getUser, isAdmin } from '../services/auth.service.js';
import { initializeAuth, setupTokenExpirationWarning } from '../utils/auth-init.js';
import { initNavbar } from '../components/navbar.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/product.service.js';
import { showModal, hideModal, showConfirmDialog, showSuccessModal, showErrorModal } from '../components/modal.js';
import { initCollapsibleFilters } from '../utils/filter-collapse.js';

// Protect this page - require admin authentication
requireAuth();

// Initialize authentication state
initializeAuth().then(user => {
  if (user) {
    if (!isAdmin()) {
      window.location.href = '/dashboard.html';
      return;
    }
    console.log('Manage Products page loaded for admin:', user.name);
    loadProducts();
  }
});

// Setup token expiration warning
setupTokenExpirationWarning();

// Initialize navigation bar
initNavbar();

// Initialize collapsible filters
initCollapsibleFilters('filters-section', {
  buttonText: '🔍 Show Filters',
  expandedText: '✕ Hide Filters'
});

// Cache for products
let productsCache = [];
let filteredProducts = [];

/**
 * Show loading spinner
 */
function showLoading() {
  const container = document.getElementById('products-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('products-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="error-container">
      <p class="error-message">❌ ${message}</p>
      <button onclick="location.reload()" class="btn btn-outline">Retry</button>
    </div>
  `;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GMD',
  }).format(amount);
}

/**
 * Load all products
 */
async function loadProducts() {
  showLoading();

  try {
    const response = await getProducts({ limit: 1000, sort: 'name' });
    productsCache = response.data?.products || response.data || [];
    filteredProducts = [...productsCache];

    displayProducts(filteredProducts);
  } catch (error) {
    console.error('Error loading products:', error);
    showError('Failed to load products');
  }
}

/**
 * Display products table
 */
function displayProducts(products) {
  const container = document.getElementById('products-table-container');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>📦 No products found</p>
        <button onclick="window.handleAddProduct()" class="btn btn-primary">Add Your First Product</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Unit</th>
          <th>Available</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(product => `
          <tr>
            <td>
              <strong>${product.name}</strong>
              ${product.description ? `<br><small>${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>` : ''}
            </td>
            <td><span class="badge">${product.category || 'N/A'}</span></td>
            <td>${product.price ? formatCurrency(product.price) : 'N/A'}</td>
            <td>${product.stock || 0}</td>
            <td>${product.unit || 'N/A'}</td>
            <td>
              <span class="badge badge-${product.isAvailable ? 'success' : 'danger'}">
                ${product.isAvailable ? '✓ Yes' : '✗ No'}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button onclick="window.handleViewProduct('${product._id}')" class="btn btn-sm btn-outline" title="View">
                  👁️
                </button>
                <button onclick="window.handleEditProduct('${product._id}')" class="btn btn-sm btn-primary" title="Edit">
                  ✏️
                </button>
                <button onclick="window.handleDeleteProduct('${product._id}')" class="btn btn-sm btn-danger" title="Delete">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Handle view product
 */
window.handleViewProduct = async function (productId) {
  const product = productsCache.find(p => p._id === productId);
  if (!product) return;

  const content = `
    <div class="product-details">
      <div class="detail-row">
        <strong>Name:</strong>
        <span>${product.name}</span>
      </div>
      <div class="detail-row">
        <strong>Description:</strong>
        <span>${product.description || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Category:</strong>
        <span>${product.category || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Price:</strong>
        <span>${product.price ? formatCurrency(product.price) : 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Stock:</strong>
        <span>${product.stock || 0}</span>
      </div>
      <div class="detail-row">
        <strong>Unit:</strong>
        <span>${product.unit || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Available:</strong>
        <span class="badge badge-${product.isAvailable ? 'success' : 'danger'}">
          ${product.isAvailable ? 'Yes' : 'No'}
        </span>
      </div>
      ${product.image ? `
        <div class="detail-row">
          <strong>Image:</strong>
          <img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 8px; margin-top: 8px;">
        </div>
      ` : ''}
    </div>
  `;

  showModal({
    title: 'Product Details',
    content,
    size: 'medium',
    actions: [
      {
        label: 'Edit',
        onClick: () => {
          hideModal();
          window.handleEditProduct(productId);
        },
        className: 'btn-primary'
      },
      {
        label: 'Close',
        onClick: hideModal,
        className: 'btn-outline'
      }
    ]
  });
};

/**
 * Handle add product
 */
window.handleAddProduct = function () {
  const content = `
    <form id="product-form" class="form">
      <div class="form-group">
        <label for="product-name" class="form-label required">Product Name</label>
        <input type="text" id="product-name" class="form-input" required>
      </div>
      
      <div class="form-group">
        <label for="product-description" class="form-label">Description</label>
        <textarea id="product-description" class="form-textarea" rows="3"></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="product-category" class="form-label required">Category</label>
          <select id="product-category" class="form-select" required>
            <option value="">Select category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Meat">Meat</option>
            <option value="Dairy">Dairy</option>
            <option value="Seafood">Seafood</option>
            <option value="Spices">Spices</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="product-price" class="form-label required">Price ($)</label>
          <input type="number" id="product-price" class="form-input" step="0.01" min="0" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="product-stock" class="form-label">Stock</label>
          <input type="number" id="product-stock" class="form-input" min="0" value="0" required>
        </div>
        
        <div class="form-group">
          <label for="product-unit" class="form-label">Unit</label>
          <select id="product-unit" class="form-select">
            <option value="kg">Kilogram (kg)</option>
            <option value="lb">Pound (lb)</option>
            <option value="piece">Piece</option>
            <option value="dozen">Dozen</option>
            <option value="liter">Liter</option>
            <option value="gallon">Gallon</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="product-image" class="form-label">Image URL</label>
        <input type="url" id="product-image" class="form-input" placeholder="https://example.com/image.jpg">
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="product-available" checked>
          <span>Available for purchase</span>
        </label>
      </div>
    </form>
  `;

  showModal({
    title: 'Add New Product',
    content,
    size: 'large',
    actions: [
      {
        label: 'Create Product',
        onClick: handleCreateProduct,
        className: 'btn-primary'
      },
      {
        label: 'Cancel',
        onClick: hideModal,
        className: 'btn-outline'
      }
    ]
  });
};

/**
 * Handle create product
 */
async function handleCreateProduct() {
  const form = document.getElementById('product-form');
  console.log('🔍 Form element:', form);

  if (!form) {
    console.error('❌ Form not found!');
    showErrorModal('Form not found. Please try again.');
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const productData = {
    name: document.getElementById('product-name').value,
    description: document.getElementById('product-description').value,
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value) || 0,
    stock: parseInt(document.getElementById('product-stock').value) || 0,
    unit: document.getElementById('product-unit').value,
    image: document.getElementById('product-image').value,
    isAvailable: document.getElementById('product-available').checked
  };

  console.log('📦 Product data to send:', productData);

  try {
    await createProduct(productData);
    hideModal();
    showSuccessModal('Product created successfully!');
    loadProducts();
  } catch (error) {
    console.error('Error creating product:', error);
    showErrorModal(error.message || 'Failed to create product');
  }
}

/**
 * Handle edit product
 */
window.handleEditProduct = async function (productId) {
  const product = productsCache.find(p => p._id === productId);
  if (!product) return;

  const content = `
    <form id="product-form" class="form">
      <div class="form-group">
        <label for="product-name" class="form-label required">Product Name</label>
        <input type="text" id="product-name" class="form-input" value="${product.name}" required>
      </div>
      
      <div class="form-group">
        <label for="product-description" class="form-label">Description</label>
        <textarea id="product-description" class="form-textarea" rows="3">${product.description || ''}</textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="product-category" class="form-label required">Category</label>
          <select id="product-category" class="form-select" required>
            <option value="">Select category</option>
            <option value="Vegetables" ${product.category === 'Vegetables' ? 'selected' : ''}>Vegetables</option>
            <option value="Fruits" ${product.category === 'Fruits' ? 'selected' : ''}>Fruits</option>
            <option value="Grains" ${product.category === 'Grains' ? 'selected' : ''}>Grains</option>
            <option value="Meat" ${product.category === 'Meat' ? 'selected' : ''}>Meat</option>
            <option value="Dairy" ${product.category === 'Dairy' ? 'selected' : ''}>Dairy</option>
            <option value="Seafood" ${product.category === 'Seafood' ? 'selected' : ''}>Seafood</option>
            <option value="Spices" ${product.category === 'Spices' ? 'selected' : ''}>Spices</option>
            <option value="Other" ${product.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="product-price" class="form-label">Price ($)</label>
          <input type="number" id="product-price" class="form-input" step="0.01" min="0" value="${product.price || 0}">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="product-stock" class="form-label">Stock</label>
          <input type="number" id="product-stock" class="form-input" min="0" value="${product.stock || 0}">
        </div>
        
        <div class="form-group">
          <label for="product-unit" class="form-label">Unit</label>
          <select id="product-unit" class="form-select">
            <option value="kg" ${product.unit === 'kg' ? 'selected' : ''}>Kilogram (kg)</option>
            <option value="lb" ${product.unit === 'lb' ? 'selected' : ''}>Pound (lb)</option>
            <option value="piece" ${product.unit === 'piece' ? 'selected' : ''}>Piece</option>
            <option value="dozen" ${product.unit === 'dozen' ? 'selected' : ''}>Dozen</option>
            <option value="liter" ${product.unit === 'liter' ? 'selected' : ''}>Liter</option>
            <option value="gallon" ${product.unit === 'gallon' ? 'selected' : ''}>Gallon</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="product-image" class="form-label">Image URL</label>
        <input type="url" id="product-image" class="form-input" value="${product.image || ''}" placeholder="https://example.com/image.jpg">
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="product-available" ${product.isAvailable ? 'checked' : ''}>
          <span>Available for purchase</span>
        </label>
      </div>
    </form>
  `;

  showModal({
    title: 'Edit Product',
    content,
    size: 'large',
    actions: [
      {
        label: 'Update Product',
        onClick: () => handleUpdateProduct(productId),
        className: 'btn-primary'
      },
      {
        label: 'Cancel',
        onClick: hideModal,
        className: 'btn-outline'
      }
    ]
  });
};

/**
 * Handle update product
 */
async function handleUpdateProduct(productId) {
  const form = document.getElementById('product-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const productData = {
    name: document.getElementById('product-name').value,
    description: document.getElementById('product-description').value,
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value) || 0,
    stock: parseInt(document.getElementById('product-stock').value) || 0,
    unit: document.getElementById('product-unit').value,
    image: document.getElementById('product-image').value,
    isAvailable: document.getElementById('product-available').checked
  };

  try {
    await updateProduct(productId, productData);
    hideModal();
    showSuccessModal('Product updated successfully!');
    loadProducts();
  } catch (error) {
    console.error('Error updating product:', error);
    showErrorModal(error.message || 'Failed to update product');
  }
}

/**
 * Handle delete product
 */
window.handleDeleteProduct = async function (productId) {
  const product = productsCache.find(p => p._id === productId);
  if (!product) return;

  const confirmed = await showConfirmDialog(
    'Delete Product',
    `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await deleteProduct(productId);
    showSuccessModal('Product deleted successfully!');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showErrorModal(error.message || 'Failed to delete product');
  }
};

/**
 * Apply filters
 */
function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  const availabilityFilter = document.getElementById('availability-filter').value;

  filteredProducts = productsCache.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesAvailability = !availabilityFilter ||
      String(product.isAvailable) === availabilityFilter;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  displayProducts(filteredProducts);
}

// Event listeners
document.getElementById('add-product-btn')?.addEventListener('click', window.handleAddProduct);
document.getElementById('search-input')?.addEventListener('input', applyFilters);
document.getElementById('category-filter')?.addEventListener('change', applyFilters);
document.getElementById('availability-filter')?.addEventListener('change', applyFilters);
