/**
 * Prices Page
 * Public page for viewing approved price submissions without authentication
 */

import { apiConfig, buildURL } from '../config/api.config.js';
import { showModal, hideModal } from '../components/modal.js';
import { initNavbar } from '../components/navbar.js';
import { initCollapsibleFilters } from '../utils/filter-collapse.js';

// Initialize navigation bar (works for both authenticated and non-authenticated users)
initNavbar();

// Initialize collapsible filters
initCollapsibleFilters('filters-section', {
  buttonText: '🔍 Show Filters',
  expandedText: '✕ Hide Filters'
});

// Cache for data
let pricesCache = [];
let productsCache = [];
let marketsCache = [];
let filteredPrices = [];

/**
 * Show loading spinner
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading prices...</p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="error-container">
      <p class="error-message">❌ ${message}</p>
      <button onclick="location.reload()" class="btn btn-outline">Retry</button>
    </div>
  `;
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
 * Make public API request (no authentication needed)
 */
async function publicRequest(endpoint) {
  try {
    const url = buildURL(endpoint);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Load all data
 */
async function loadData() {
  showLoading('prices-container');

  try {
    // Fetch data in parallel (public endpoints, no auth required)
    const [pricesRes, productsRes, marketsRes] = await Promise.all([
      publicRequest('/price-submissions?status=approved&limit=1000&sort=-date'),
      publicRequest('/products?limit=1000&sort=name'),
      publicRequest('/markets?limit=1000&sort=name'),
    ]);

    pricesCache = pricesRes.data?.priceSubmissions || pricesRes.data || [];
    productsCache = productsRes.data?.products || productsRes.data || [];
    marketsCache = marketsRes.data?.markets || marketsRes.data || [];

    filteredPrices = [...pricesCache];

    // Populate filter dropdowns
    populateFilters();

    // Display statistics
    displayStatistics();

    // Display prices
    displayPrices(filteredPrices);
  } catch (error) {
    console.error('Error loading data:', error);
    showError('prices-container', 'Failed to load prices. Please try again.');
  }
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
  const productFilter = document.getElementById('product-filter');
  const marketFilter = document.getElementById('market-filter');

  if (productFilter && productsCache.length > 0) {
    const productOptions = productsCache.map(p =>
      `<option value="${p._id}">${p.name}</option>`
    ).join('');
    productFilter.innerHTML = `<option value="">All Products</option>${productOptions}`;
  }

  if (marketFilter && marketsCache.length > 0) {
    const marketOptions = marketsCache.map(m =>
      `<option value="${m._id}">${m.name}</option>`
    ).join('');
    marketFilter.innerHTML = `<option value="">All Markets</option>${marketOptions}`;
  }
}

/**
 * Display statistics
 */
function displayStatistics() {
  const container = document.getElementById('price-stats');
  if (!container) return;

  const totalPrices = pricesCache.length;
  const uniqueProducts = new Set(pricesCache.map(p => p.product?._id || p.product)).size;
  const uniqueMarkets = new Set(pricesCache.map(p => p.market?._id || p.market)).size;

  // Calculate average price
  const avgPrice = pricesCache.length > 0
    ? pricesCache.reduce((sum, p) => sum + (p.price || 0), 0) / pricesCache.length
    : 0;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-content">
        <h3 class="stat-value">${totalPrices}</h3>
        <p class="stat-label">Total Prices</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-content">
        <h3 class="stat-value">${uniqueProducts}</h3>
        <p class="stat-label">Products</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🏪</div>
      <div class="stat-content">
        <h3 class="stat-value">${uniqueMarkets}</h3>
        <p class="stat-label">Markets</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-content">
        <h3 class="stat-value">${formatCurrency(avgPrice)}</h3>
        <p class="stat-label">Avg Price</p>
      </div>
    </div>
  `;
}

/**
 * Display prices in a grid
 */
function displayPrices(prices) {
  const container = document.getElementById('prices-container');
  if (!container) return;

  if (prices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>💰 No approved prices found</p>
        <p>Check back later for updated pricing information</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="prices-grid">
      ${prices.map(price => `
        <div class="price-card" onclick="window.handleViewPrice('${price._id}')">
          <div class="price-card-header">
            <h3 class="price-product">${price.product?.name || 'Unknown Product'}</h3>
            <span class="price-amount">${formatCurrency(price.price)}</span>
          </div>
          <div class="price-card-body">
            <div class="price-detail">
              <span class="price-label">Market:</span>
              <span class="price-value">${price.market?.name || 'N/A'}</span>
            </div>
            <div class="price-detail">
              <span class="price-label">Location:</span>
              <span class="price-value">${price.market?.address?.city || 'N/A'}, ${price.market?.address?.state || 'N/A'}</span>
            </div>
            <div class="price-detail">
              <span class="price-label">Unit:</span>
              <span class="price-value">${price.unit}</span>
            </div>
            <div class="price-detail">
              <span class="price-label">Date:</span>
              <span class="price-value">${formatDate(price.date)}</span>
            </div>
          </div>
          <div class="price-card-footer">
            <span class="badge badge-success">✓ Verified</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Handle view price details
 */
window.handleViewPrice = function (priceId) {
  const price = pricesCache.find(p => p._id === priceId);
  if (!price) return;

  const content = `
    <div class="price-details">
      <div class="detail-row">
        <strong>Product:</strong>
        <span>${price.product?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Category:</strong>
        <span>${price.product?.category || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Market:</strong>
        <span>${price.market?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Market Type:</strong>
        <span>${price.market?.type || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Location:</strong>
        <span>
          ${price.market?.address ? `
            ${price.market.address.street || ''}<br>
            ${price.market.address.city || ''}, ${price.market.address.state || ''}, The Gambia
          ` : 'N/A'}
        </span>
      </div>
      <div class="detail-row">
        <strong>Price:</strong>
        <span class="price-highlight">${formatCurrency(price.price)}</span>
      </div>
      <div class="detail-row">
        <strong>Unit:</strong>
        <span>${price.unit}</span>
      </div>
      <div class="detail-row">
        <strong>Date:</strong>
        <span>${formatDate(price.date)}</span>
      </div>
      <div class="detail-row">
        <strong>Status:</strong>
        <span class="badge badge-success">Verified</span>
      </div>
      ${price.notes ? `
        <div class="detail-row">
          <strong>Notes:</strong>
          <span>${price.notes}</span>
        </div>
      ` : ''}
    </div>
  `;

  showModal({
    title: 'Price Details',
    content,
    size: 'medium',
    actions: [
      {
        label: 'Close',
        onClick: hideModal,
        className: 'btn-primary'
      }
    ]
  });
};

/**
 * Apply filters and sorting
 */
function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const productFilter = document.getElementById('product-filter').value;
  const marketFilter = document.getElementById('market-filter').value;
  const sortFilter = document.getElementById('sort-filter').value;

  // Filter
  filteredPrices = pricesCache.filter(price => {
    const matchesSearch =
      (price.product?.name && price.product.name.toLowerCase().includes(searchTerm)) ||
      (price.market?.name && price.market.name.toLowerCase().includes(searchTerm)) ||
      (price.market?.address?.city && price.market.address.city.toLowerCase().includes(searchTerm));

    const matchesProduct = !productFilter ||
      (price.product?._id === productFilter || price.product === productFilter);

    const matchesMarket = !marketFilter ||
      (price.market?._id === marketFilter || price.market === marketFilter);

    return matchesSearch && matchesProduct && matchesMarket;
  });

  // Sort
  filteredPrices.sort((a, b) => {
    switch (sortFilter) {
      case 'price':
        return a.price - b.price;
      case '-price':
        return b.price - a.price;
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case '-date':
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  displayPrices(filteredPrices);
}

// Event listeners
document.getElementById('search-input')?.addEventListener('input', applyFilters);
document.getElementById('product-filter')?.addEventListener('change', applyFilters);
document.getElementById('market-filter')?.addEventListener('change', applyFilters);
document.getElementById('sort-filter')?.addEventListener('change', applyFilters);

// Load data on page load
document.addEventListener('DOMContentLoaded', loadData);
