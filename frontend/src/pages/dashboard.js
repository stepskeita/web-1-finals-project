/**
 * Dashboard Page
 * Main user dashboard with statistics and recent activity
 */

import { requireAuth, getUser, isAdmin } from '../services/auth.service.js';
import { initializeAuth, setupTokenExpirationWarning } from '../utils/auth-init.js';
import { initNavbar } from '../components/navbar.js';
import { getProducts } from '../services/product.service.js';
import { getMarkets } from '../services/market.service.js';
import {
  getPriceSubmissions,
  updatePriceSubmission,
  deletePriceSubmission,
  verifyPriceSubmission,
  rejectPriceSubmission
} from '../services/price-submission.service.js';
import { showModal, hideModal, showConfirmDialog, showSuccessModal, showErrorModal } from '../components/modal.js';

// Protect this page - require authentication
requireAuth();

// Initialize authentication state
initializeAuth().then(user => {
  if (user) {
    console.log('Dashboard loaded for user:', user.name);
    loadDashboardData();
  }
});

// Setup token expiration warning
setupTokenExpirationWarning();

// Initialize navigation bar
initNavbar();

/**
 * Show loading spinner
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
  }
}

/**
 * Show error message
 */
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
  }
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
 * Load dashboard statistics
 */
async function loadStatistics() {
  const user = getUser();
  showLoading('stats-container');

  try {
    // Fetch data in parallel
    const [productsRes, marketsRes, submissionsRes] = await Promise.all([
      getProducts({ limit: 1000 }),
      getMarkets({ limit: 1000 }),
      getPriceSubmissions({ limit: 1000 }),
    ]);

    const products = productsRes.data?.products || productsRes.data || [];
    const markets = marketsRes.data?.markets || marketsRes.data || [];
    const submissions = submissionsRes.data?.priceSubmissions || submissionsRes.data || [];

    // Calculate statistics
    const totalProducts = products.length;
    const totalMarkets = markets.length;
    const totalSubmissions = submissions.length;

    // User-specific stats
    const mySubmissions = submissions.filter(s => s.submittedBy?._id === user._id || s.submittedBy === user._id);
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;

    // Display statistics
    displayStatistics({
      totalProducts,
      totalMarkets,
      totalSubmissions,
      mySubmissions: mySubmissions.length,
      pendingSubmissions,
    });

  } catch (error) {
    console.error('Error loading statistics:', error);
    showError('stats-container', 'Failed to load statistics');
  }
}

/**
 * Display statistics cards
 */
function displayStatistics(stats) {
  const container = document.getElementById('stats-container');
  if (!container) return;

  const user = getUser();
  const adminView = isAdmin();

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3 class="stat-value">${stats.totalProducts}</h3>
          <p class="stat-label">Total Products</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🏪</div>
        <div class="stat-content">
          <h3 class="stat-value">${stats.totalMarkets}</h3>
          <p class="stat-label">Total Markets</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3 class="stat-value">${stats.totalSubmissions}</h3>
          <p class="stat-label">Price Submissions</p>
        </div>
      </div>
      
      ${adminView ? `
        <div class="stat-card stat-card-warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3 class="stat-value">${stats.pendingSubmissions}</h3>
            <p class="stat-label">Pending Review</p>
          </div>
        </div>
      ` : `
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3 class="stat-value">${stats.mySubmissions}</h3>
            <p class="stat-label">My Submissions</p>
          </div>
        </div>
      `}
    </div>
  `;
}

/**
 * Load recent price submissions
 */
async function loadRecentSubmissions() {
  const user = getUser();
  showLoading('recent-submissions-container');

  try {
    // Fetch recent submissions
    const response = await getPriceSubmissions({
      limit: 10,
      sort: '-createdAt',
    });

    const submissions = response.data?.priceSubmissions || response.data || [];

    // Cache submissions for modal access
    window.submissionsCache = submissions;

    // Filter by user if not admin
    const displaySubmissions = isAdmin()
      ? submissions
      : submissions.filter(s => s.submittedBy?._id === user._id || s.submittedBy === user._id);

    displayRecentSubmissions(displaySubmissions);

  } catch (error) {
    console.error('Error loading recent submissions:', error);
    showError('recent-submissions-container', 'Failed to load recent submissions');
  }
}

/**
 * Display recent submissions table
 */
function displayRecentSubmissions(submissions) {
  const container = document.getElementById('recent-submissions-container');
  if (!container) return;

  if (submissions.length === 0) {
    container.innerHTML = '<div class="empty-state">No price submissions yet</div>';
    return;
  }

  const userIsAdmin = isAdmin();

  const tableHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Market</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Date</th>
            <th>Status</th>
            ${userIsAdmin ? '<th>Submitted By</th>' : ''}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${submissions.map(submission => `
            <tr data-submission-id="${submission._id}">
              <td>${submission.product?.name || 'N/A'}</td>
              <td>${submission.market?.name || 'N/A'}</td>
              <td>${formatCurrency(submission.price)}</td>
              <td>${submission.unit}</td>
              <td>${formatDate(submission.date)}</td>
              <td><span class="badge badge-${submission.status}">${submission.status}</span></td>
              ${userIsAdmin ? `<td>${submission.submittedBy?.name || 'N/A'}</td>` : ''}
              <td>
                <div class="action-buttons">
                  ${userIsAdmin && submission.status === 'pending' ? `
                    <button class="btn-icon btn-success" onclick="window.handleApprove('${submission._id}')" title="Approve">
                      <span>✓</span>
                    </button>
                    <button class="btn-icon btn-danger" onclick="window.handleReject('${submission._id}')" title="Reject">
                      <span>✗</span>
                    </button>
                  ` : ''}
                  ${userIsAdmin ? `
                    <button class="btn-icon btn-primary" onclick="window.handleEdit('${submission._id}')" title="Edit">
                      <span>✎</span>
                    </button>
                    <button class="btn-icon btn-danger" onclick="window.handleDelete('${submission._id}')" title="Delete">
                      <span>🗑</span>
                    </button>
                  ` : ''}
                  <button class="btn-icon btn-secondary" onclick="window.handleView('${submission._id}')" title="View Details">
                    <span>👁</span>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

/**
 * Handle view submission details
 */
window.handleView = function (submissionId) {
  const submission = window.submissionsCache?.find(s => s._id === submissionId);
  if (!submission) return;

  const content = `
    <div class="submission-details">
      <div class="detail-row">
        <strong>Product:</strong>
        <span>${submission.product?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Category:</strong>
        <span>${submission.product?.category || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Market:</strong>
        <span>${submission.market?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Location:</strong>
        <span>${submission.market?.address?.city || 'N/A'}, ${submission.market?.address?.state || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <strong>Price:</strong>
        <span>${formatCurrency(submission.price)}</span>
      </div>
      <div class="detail-row">
        <strong>Unit:</strong>
        <span>${submission.unit}</span>
      </div>
      <div class="detail-row">
        <strong>Date:</strong>
        <span>${formatDate(submission.date)}</span>
      </div>
      <div class="detail-row">
        <strong>Status:</strong>
        <span class="badge badge-${submission.status}">${submission.status}</span>
      </div>
      <div class="detail-row">
        <strong>Submitted By:</strong>
        <span>${submission.submittedBy?.name || 'N/A'}</span>
      </div>
      ${submission.notes ? `
        <div class="detail-row">
          <strong>Notes:</strong>
          <span>${submission.notes}</span>
        </div>
      ` : ''}
      <div class="detail-row">
        <strong>Created:</strong>
        <span>${formatDate(submission.createdAt)}</span>
      </div>
      ${submission.updatedAt !== submission.createdAt ? `
        <div class="detail-row">
          <strong>Updated:</strong>
          <span>${formatDate(submission.updatedAt)}</span>
        </div>
      ` : ''}
    </div>
  `;

  showModal('Submission Details', content, {
    actions: [
      {
        id: 'close',
        label: 'Close',
        class: 'btn-primary',
        handler: hideModal
      }
    ]
  });
};

/**
 * Handle edit submission
 */
window.handleEdit = async function (submissionId) {
  const submission = window.submissionsCache?.find(s => s._id === submissionId);
  if (!submission) return;

  const content = `
    <form id="edit-submission-form" class="modal-form">
      <div class="form-group">
        <label for="edit-price">Price ($) *</label>
        <input type="number" id="edit-price" value="${submission.price}" step="0.01" min="0" required>
        <span class="error-message" id="edit-price-error"></span>
      </div>
      
      <div class="form-group">
        <label for="edit-unit">Unit *</label>
        <select id="edit-unit" required>
          <option value="piece" ${submission.unit === 'piece' ? 'selected' : ''}>Piece</option>
          <option value="kg" ${submission.unit === 'kg' ? 'selected' : ''}>Kilogram (kg)</option>
          <option value="lb" ${submission.unit === 'lb' ? 'selected' : ''}>Pound (lb)</option>
          <option value="oz" ${submission.unit === 'oz' ? 'selected' : ''}>Ounce (oz)</option>
          <option value="g" ${submission.unit === 'g' ? 'selected' : ''}>Gram (g)</option>
          <option value="dozen" ${submission.unit === 'dozen' ? 'selected' : ''}>Dozen</option>
          <option value="liter" ${submission.unit === 'liter' ? 'selected' : ''}>Liter</option>
          <option value="gallon" ${submission.unit === 'gallon' ? 'selected' : ''}>Gallon</option>
          <option value="bunch" ${submission.unit === 'bunch' ? 'selected' : ''}>Bunch</option>
          <option value="bag" ${submission.unit === 'bag' ? 'selected' : ''}>Bag</option>
          <option value="box" ${submission.unit === 'box' ? 'selected' : ''}>Box</option>
          <option value="other" ${submission.unit === 'other' ? 'selected' : ''}>Other</option>
        </select>
        <span class="error-message" id="edit-unit-error"></span>
      </div>
      
      <div class="form-group">
        <label for="edit-date">Date *</label>
        <input type="date" id="edit-date" value="${submission.date.split('T')[0]}" required>
        <span class="error-message" id="edit-date-error"></span>
      </div>
      
      <div class="form-group">
        <label for="edit-notes">Notes</label>
        <textarea id="edit-notes" rows="3" maxlength="500">${submission.notes || ''}</textarea>
      </div>
      
      <div class="form-message" id="edit-form-message"></div>
    </form>
  `;

  showModal('Edit Price Submission', content, {
    size: 'medium',
    actions: [
      {
        id: 'cancel',
        label: 'Cancel',
        class: 'btn-secondary',
        handler: hideModal
      },
      {
        id: 'save',
        label: 'Save Changes',
        class: 'btn-primary',
        handler: async () => {
          const priceInput = document.getElementById('edit-price');
          const unitInput = document.getElementById('edit-unit');
          const dateInput = document.getElementById('edit-date');
          const notesInput = document.getElementById('edit-notes');
          const saveBtn = document.querySelector('[data-action="save"]');

          // Validate
          const price = parseFloat(priceInput.value);
          if (!price || price <= 0) {
            document.getElementById('edit-price-error').textContent = 'Please enter a valid price';
            return;
          }

          try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            const updateData = {
              price: price,
              unit: unitInput.value,
              date: dateInput.value,
              notes: notesInput.value
            };

            await updatePriceSubmission(submissionId, updateData);

            hideModal();
            showSuccessModal('Price submission updated successfully!');

            // Reload data
            await loadRecentSubmissions();
            await loadStatistics();

          } catch (error) {
            console.error('Error updating submission:', error);
            const messageEl = document.getElementById('edit-form-message');
            if (messageEl) {
              messageEl.textContent = error.message || 'Failed to update submission';
              messageEl.className = 'form-message error';
              messageEl.style.display = 'block';
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
          }
        }
      }
    ]
  });
};

/**
 * Handle delete submission
 */
window.handleDelete = async function (submissionId) {
  const submission = window.submissionsCache?.find(s => s._id === submissionId);
  if (!submission) return;

  const confirmed = await showConfirmDialog(
    'Delete Submission',
    `Are you sure you want to delete this price submission for ${submission.product?.name || 'this product'}? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await deletePriceSubmission(submissionId);
    showSuccessModal('Price submission deleted successfully!');

    // Reload data
    await loadRecentSubmissions();
    await loadStatistics();

  } catch (error) {
    console.error('Error deleting submission:', error);
    showErrorModal(error.message || 'Failed to delete submission');
  }
};

/**
 * Handle approve submission
 */
window.handleApprove = async function (submissionId) {
  const confirmed = await showConfirmDialog(
    'Approve Submission',
    'Are you sure you want to approve this price submission?'
  );

  if (!confirmed) return;

  try {
    await verifyPriceSubmission(submissionId);
    showSuccessModal('Price submission approved successfully!');

    // Reload data
    await loadRecentSubmissions();
    await loadStatistics();

  } catch (error) {
    console.error('Error approving submission:', error);
    showErrorModal(error.message || 'Failed to approve submission');
  }
};

/**
 * Handle reject submission
 */
window.handleReject = function (submissionId) {
  const content = `
    <form id="reject-form" class="modal-form">
      <div class="form-group">
        <label for="reject-reason">Reason for Rejection *</label>
        <textarea id="reject-reason" rows="4" required placeholder="Please provide a reason for rejecting this submission"></textarea>
        <span class="error-message" id="reject-reason-error"></span>
      </div>
    </form>
  `;

  showModal('Reject Submission', content, {
    actions: [
      {
        id: 'cancel',
        label: 'Cancel',
        class: 'btn-secondary',
        handler: hideModal
      },
      {
        id: 'reject',
        label: 'Reject',
        class: 'btn-danger',
        handler: async () => {
          const reasonInput = document.getElementById('reject-reason');
          const reason = reasonInput.value.trim();

          if (!reason) {
            document.getElementById('reject-reason-error').textContent = 'Please provide a reason';
            return;
          }

          const rejectBtn = document.querySelector('[data-action="reject"]');

          try {
            rejectBtn.disabled = true;
            rejectBtn.textContent = 'Rejecting...';

            await rejectPriceSubmission(submissionId, reason);

            hideModal();
            showSuccessModal('Price submission rejected!');

            // Reload data
            await loadRecentSubmissions();
            await loadStatistics();

          } catch (error) {
            console.error('Error rejecting submission:', error);
            showErrorModal(error.message || 'Failed to reject submission');
            rejectBtn.disabled = false;
            rejectBtn.textContent = 'Reject';
          }
        }
      }
    ]
  });
};

/**
 * Load quick actions based on user role
 */
function loadQuickActions() {
  const container = document.getElementById('quick-actions-container');
  if (!container) return;

  const adminActions = `
    <div class="quick-actions-grid">
      <a href="/price-submission.html" class="action-card">
        <div class="action-icon">➕</div>
        <h3>Submit Price</h3>
        <p>Add new price data</p>
      </a>
      
      <a href="/manage-products.html" class="action-card">
        <div class="action-icon">📦</div>
        <h3>Manage Products</h3>
        <p>Add, edit, or remove products</p>
      </a>
      
      <a href="/manage-markets.html" class="action-card">
        <div class="action-icon">🏪</div>
        <h3>Manage Markets</h3>
        <p>Add, edit, or remove markets</p>
      </a>
      
      <a href="/prices.html" class="action-card">
        <div class="action-icon">💰</div>
        <h3>View Prices</h3>
        <p>Browse all published prices</p>
      </a>
    </div>
  `;

  const collectorActions = `
    <div class="quick-actions-grid">
      <a href="/price-submission.html" class="action-card">
        <div class="action-icon">➕</div>
        <h3>Submit Price</h3>
        <p>Add new price data</p>
      </a>
      
      <a href="/prices.html" class="action-card">
        <div class="action-icon">💰</div>
        <h3>View Prices</h3>
        <p>Browse all published prices</p>
      </a>
      
      <a href="/manage-products.html" class="action-card">
        <div class="action-icon">📦</div>
        <h3>View Products</h3>
        <p>Browse available products</p>
      </a>
      
      <a href="/manage-markets.html" class="action-card">
        <div class="action-icon">🏪</div>
        <h3>View Markets</h3>
        <p>Browse available markets</p>
      </a>
    </div>
  `;

  container.innerHTML = isAdmin() ? adminActions : collectorActions;
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  const user = getUser();

  if (!user) return;

  // Display welcome message
  const welcomeElement = document.querySelector('.page-header h2');
  if (welcomeElement) {
    welcomeElement.textContent = `Welcome back, ${user.name}!`;
  }

  const subtitleElement = document.querySelector('.page-header p');
  if (subtitleElement) {
    subtitleElement.textContent = `Here's an overview of your activity as ${user.role}.`;
  }

  // Load all dashboard components
  await Promise.all([
    loadStatistics(),
    loadRecentSubmissions(),
  ]);

  loadQuickActions();

  console.log('Dashboard data loaded successfully');
}

console.log('Dashboard page initialized');
