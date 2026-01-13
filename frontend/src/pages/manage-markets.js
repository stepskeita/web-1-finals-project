/**
 * Manage Markets Page
 * Admin page for CRUD operations on markets
 */

import { requireAuth, getUser, isAdmin } from '../services/auth.service.js';
import { initializeAuth, setupTokenExpirationWarning } from '../utils/auth-init.js';
import { initNavbar } from '../components/navbar.js';
import {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket
} from '../services/market.service.js';
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
    console.log('Manage Markets page loaded for admin:', user.name);
    loadMarkets();
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

// Cache for markets
let marketsCache = [];
let filteredMarkets = [];

/**
 * Show loading spinner
 */
function showLoading() {
  const container = document.getElementById('markets-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading markets...</p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('markets-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="error-container">
      <p class="error-message">❌ ${message}</p>
      <button onclick="location.reload()" class="btn btn-outline">Retry</button>
    </div>
  `;
}

/**
 * Load all markets
 */
async function loadMarkets() {
  showLoading();

  try {
    const response = await getMarkets({ limit: 1000, sort: 'name' });
    marketsCache = response.data?.markets || response.data || [];
    filteredMarkets = [...marketsCache];

    displayMarkets(filteredMarkets);
  } catch (error) {
    console.error('Error loading markets:', error);
    showError('Failed to load markets');
  }
}

/**
 * Display markets table
 */
function displayMarkets(markets) {
  const container = document.getElementById('markets-table-container');
  if (!container) return;

  if (markets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>🏪 No markets found</p>
        <button onclick="window.handleAddMarket()" class="btn btn-primary">Add Your First Market</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Location</th>
          <th>Contact</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${markets.map(market => `
          <tr>
            <td>
              <strong>${market.name}</strong>
              ${market.description ? `<br><small>${market.description.substring(0, 50)}${market.description.length > 50 ? '...' : ''}</small>` : ''}
            </td>
            <td><span class="badge">${market.type || 'N/A'}</span></td>
            <td>
              ${market.address ? `
                ${market.address.street || ''}<br>
                ${market.address.city || ''}, ${market.address.state || ''}, The Gambia
              ` : 'N/A'}
            </td>
            <td>
              ${market.contact?.phone ? `📞 ${market.contact.phone}<br>` : ''}
              ${market.contact?.email ? `📧 ${market.contact.email}` : ''}
            </td>
            <td>
              <span class="badge badge-${market.isActive ? 'success' : 'danger'}">
                ${market.isActive ? '✓ Active' : '✗ Inactive'}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button onclick="window.handleViewMarket('${market._id}')" class="btn btn-sm btn-outline" title="View">
                  👁️
                </button>
                <button onclick="window.handleEditMarket('${market._id}')" class="btn btn-sm btn-primary" title="Edit">
                  ✏️
                </button>
                <button onclick="window.handleDeleteMarket('${market._id}')" class="btn btn-sm btn-danger" title="Delete">
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
 * Handle view market
 */
window.handleViewMarket = async function (marketId) {
  const market = marketsCache.find(m => m._id === marketId);
  if (!market) return;

  const content = `
    <div class="market-details">
      <div class="detail-row">
        <strong>Name:</strong>
        <span>${market.name}</span>
      </div>
      <div class="detail-row">
        <strong>Description:</strong>
        <span>${market.description || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Type:</strong>
        <span>${market.type || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Address:</strong>
        <span>
          ${market.address ? `
            ${market.address.street || ''}<br>
            ${market.address.city || ''}, ${market.address.state || ''}<br>
            ${market.address.country || 'The Gambia'}
          ` : 'N/A'}
        </span>
      </div>
      <div class="detail-row">
        <strong>Contact Phone:</strong>
        <span>${market.contact?.phone || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Contact Email:</strong>
        <span>${market.contact?.email || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Operating Hours:</strong>
        <span>${market.operatingHours || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Status:</strong>
        <span class="badge badge-${market.isActive ? 'success' : 'danger'}">
          ${market.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      ${market.image ? `
        <div class="detail-row">
          <strong>Image:</strong>
          <img src="${market.image}" alt="${market.name}" style="max-width: 200px; border-radius: 8px; margin-top: 8px;">
        </div>
      ` : ''}
    </div>
  `;

  showModal({
    title: 'Market Details',
    content,
    size: 'medium',
    actions: [
      {
        label: 'Edit',
        onClick: () => {
          hideModal();
          window.handleEditMarket(marketId);
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
 * Handle add market
 */
window.handleAddMarket = function () {
  const content = `
    <form id="market-form" class="form">
      <div class="form-group">
        <label for="market-name" class="form-label required">Market Name</label>
        <input type="text" id="market-name" class="form-input" required>
      </div>
      
      <div class="form-group">
        <label for="market-description" class="form-label">Description</label>
        <textarea id="market-description" class="form-textarea" rows="3"></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-type" class="form-label required">Type</label>
          <select id="market-type" class="form-select" required>
            <option value="">Select type</option>
            <option value="supermarket">Supermarket</option>
            <option value="farmers-market">Farmers Market</option>
            <option value="wholesale">Wholesale</option>
            <option value="local-store">Local Store</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>
      
      <h4 style="margin-top: 20px; margin-bottom: 10px;">Address</h4>
      
      <div class="form-group">
        <label for="market-street" class="form-label required">Street Address</label>
        <input type="text" id="market-street" class="form-input" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-city" class="form-label required">City</label>
          <input type="text" id="market-city" class="form-input" required>
        </div>
        
        <div class="form-group">
          <label for="market-state" class="form-label required">Region</label>
          <input type="text" id="market-state" class="form-input" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="market-country" class="form-label required">Country</label>
        <input type="text" id="market-country" class="form-input" value="The Gambia" readonly required>
      </div>
      
      <h4 style="margin-top: 20px; margin-bottom: 10px;">Contact Information</h4>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-phone" class="form-label required">Phone</label>
          <input type="tel" id="market-phone" class="form-input" required>
        </div>
        
        <div class="form-group">
          <label for="market-email" class="form-label required">Email</label>
          <input type="email" id="market-email" class="form-input" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="market-hours" class="form-label">Operating Hours</label>
        <input type="text" id="market-hours" class="form-input" placeholder="e.g., Mon-Fri 9AM-6PM">
      </div>
      
      <div class="form-group">
        <label for="market-image" class="form-label">Image URL</label>
        <input type="url" id="market-image" class="form-input" placeholder="https://example.com/image.jpg">
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="market-active" checked>
          <span>Active</span>
        </label>
      </div>
    </form>
  `;

  showModal({
    title: 'Add New Market',
    content,
    size: 'large',
    actions: [
      {
        label: 'Create Market',
        onClick: handleCreateMarket,
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
 * Handle create market
 */
async function handleCreateMarket() {
  const form = document.getElementById('market-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const marketData = {
    name: document.getElementById('market-name').value,
    description: document.getElementById('market-description').value,
    type: document.getElementById('market-type').value,
    address: {
      street: document.getElementById('market-street').value,
      city: document.getElementById('market-city').value,
      state: document.getElementById('market-state').value,

      country: document.getElementById('market-country').value || 'The Gambia'
    },
    contact: {
      phone: document.getElementById('market-phone').value,
      email: document.getElementById('market-email').value
    },
    operatingHours: document.getElementById('market-hours').value,
    image: document.getElementById('market-image').value,
    isActive: document.getElementById('market-active').checked
  };

  try {
    await createMarket(marketData);
    hideModal();
    showSuccessModal('Market created successfully!');
    loadMarkets();
  } catch (error) {
    console.error('Error creating market:', error);
    showErrorModal(error.message || 'Failed to create market');
  }
}

/**
 * Handle edit market
 */
window.handleEditMarket = async function (marketId) {
  const market = marketsCache.find(m => m._id === marketId);
  if (!market) return;

  const content = `
    <form id="market-form" class="form">
      <div class="form-group">
        <label for="market-name" class="form-label required">Market Name</label>
        <input type="text" id="market-name" class="form-input" value="${market.name}" required>
      </div>
      
      <div class="form-group">
        <label for="market-description" class="form-label">Description</label>
        <textarea id="market-description" class="form-textarea" rows="3">${market.description || ''}</textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-type" class="form-label required">Type</label>
          <select id="market-type" class="form-select" required>
            <option value="">Select type</option>
            <option value="supermarket" ${market.type === 'supermarket' ? 'selected' : ''}>Supermarket</option>
            <option value="farmers-market" ${market.type === 'farmers-market' ? 'selected' : ''}>Farmers Market</option>
            <option value="wholesale" ${market.type === 'wholesale' ? 'selected' : ''}>Wholesale</option>
            <option value="local-store" ${market.type === 'local-store' ? 'selected' : ''}>Local Store</option>
            <option value="online" ${market.type === 'online' ? 'selected' : ''}>Online</option>
          </select>
        </div>
      </div>
      
      <h4 style="margin-top: 20px; margin-bottom: 10px;">Address</h4>
      
      <div class="form-group">
        <label for="market-street" class="form-label">Street Address</label>
        <input type="text" id="market-street" class="form-input" value="${market.address?.street || ''}">
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-city" class="form-label">City</label>
          <input type="text" id="market-city" class="form-input" value="${market.address?.city || ''}">
        </div>
        
        <div class="form-group">
          <label for="market-state" class="form-label">Region</label>
          <input type="text" id="market-state" class="form-input" value="${market.address?.state || ''}">
        </div>
      </div>
      
      <div class="form-group">
        <label for="market-country" class="form-label">Country</label>
        <input type="text" id="market-country" class="form-input" value="${market.address?.country || 'The Gambia'}" readonly>
        </div>
      </div>
      
      <h4 style="margin-top: 20px; margin-bottom: 10px;">Contact Information</h4>
      
      <div class="form-row">
        <div class="form-group">
          <label for="market-phone" class="form-label">Phone</label>
          <input type="tel" id="market-phone" class="form-input" value="${market.contact?.phone || ''}">
        </div>
        
        <div class="form-group">
          <label for="market-email" class="form-label">Email</label>
          <input type="email" id="market-email" class="form-input" value="${market.contact?.email || ''}">
        </div>
      </div>
      
      <div class="form-group">
        <label for="market-hours" class="form-label">Operating Hours</label>
        <input type="text" id="market-hours" class="form-input" value="${market.operatingHours || ''}" placeholder="e.g., Mon-Fri 9AM-6PM">
      </div>
      
      <div class="form-group">
        <label for="market-image" class="form-label">Image URL</label>
        <input type="url" id="market-image" class="form-input" value="${market.image || ''}" placeholder="https://example.com/image.jpg">
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="market-active" ${market.isActive ? 'checked' : ''}>
          <span>Active</span>
        </label>
      </div>
    </form>
  `;

  showModal({
    title: 'Edit Market',
    content,
    size: 'large',
    actions: [
      {
        label: 'Update Market',
        onClick: () => handleUpdateMarket(marketId),
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
 * Handle update market
 */
async function handleUpdateMarket(marketId) {
  const form = document.getElementById('market-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const marketData = {
    name: document.getElementById('market-name').value,
    description: document.getElementById('market-description').value,
    type: document.getElementById('market-type').value,
    address: {
      street: document.getElementById('market-street').value,
      city: document.getElementById('market-city').value,
      state: document.getElementById('market-state').value,
      country: document.getElementById('market-country').value || 'The Gambia'
    },
    contact: {
      phone: document.getElementById('market-phone').value,
      email: document.getElementById('market-email').value
    },
    operatingHours: document.getElementById('market-hours').value,
    image: document.getElementById('market-image').value,
    isActive: document.getElementById('market-active').checked
  };

  try {
    await updateMarket(marketId, marketData);
    hideModal();
    showSuccessModal('Market updated successfully!');
    loadMarkets();
  } catch (error) {
    console.error('Error updating market:', error);
    showErrorModal(error.message || 'Failed to update market');
  }
}

/**
 * Handle delete market
 */
window.handleDeleteMarket = async function (marketId) {
  const market = marketsCache.find(m => m._id === marketId);
  if (!market) return;

  const confirmed = await showConfirmDialog(
    'Delete Market',
    `Are you sure you want to delete "${market.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await deleteMarket(marketId);
    showSuccessModal('Market deleted successfully!');
    loadMarkets();
  } catch (error) {
    console.error('Error deleting market:', error);
    showErrorModal(error.message || 'Failed to delete market');
  }
};

/**
 * Apply filters
 */
function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const typeFilter = document.getElementById('type-filter').value;
  const statusFilter = document.getElementById('status-filter').value;

  filteredMarkets = marketsCache.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm) ||
      (market.description && market.description.toLowerCase().includes(searchTerm)) ||
      (market.address?.city && market.address.city.toLowerCase().includes(searchTerm));
    const matchesType = !typeFilter || market.type === typeFilter;
    const matchesStatus = !statusFilter || String(market.isActive) === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  displayMarkets(filteredMarkets);
}

// Event listeners
document.getElementById('add-market-btn')?.addEventListener('click', window.handleAddMarket);
document.getElementById('search-input')?.addEventListener('input', applyFilters);
document.getElementById('type-filter')?.addEventListener('change', applyFilters);
document.getElementById('status-filter')?.addEventListener('change', applyFilters);
