/**
 * Modal Component
 * Reusable modal dialog for forms and confirmations
 */

/**
 * Create and show modal
 * @param {string|Object} titleOrConfig - Modal title string OR config object with {title, content, actions, size, closeButton, onClose}
 * @param {string} content - Modal content HTML (if using separate params)
 * @param {Object} options - Modal options (if using separate params)
 */
export function showModal(titleOrConfig, content, options = {}) {
  // Handle both object config and separate parameters
  let title, modalContent, closeButton, actions, size, onClose;

  if (typeof titleOrConfig === 'object') {
    // Object config format: showModal({ title, content, actions, ... })
    ({
      title,
      content: modalContent,
      closeButton = true,
      actions =[],
      size = 'medium',
      onClose = null
    } = titleOrConfig);
  } else {
    // Separate parameters format: showModal(title, content, options)
    title = titleOrConfig;
    modalContent = content;
    ({
      closeButton = true,
      actions =[],
      size = 'medium',
      onClose = null
    } = options);
  }

  // Remove existing modal if any
  hideModal();

  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-dialog modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          ${closeButton ? '<button class="modal-close" id="modal-close">&times;</button>' : ''}
        </div>
        <div class="modal-body">
          ${modalContent}
        </div>
        ${actions.length > 0 ? `
          <div class="modal-footer">
            ${actions.map(action =>
    `<button class="btn ${action.className || action.class || 'btn-secondary'}" data-action="${action.label.replace(/\s+/g, '-').toLowerCase()}">${action.label}</button>`
  ).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  // Handle close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideModal();
      if (onClose) onClose();
    });
  }

  // Handle overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideModal();
      if (onClose) onClose();
    }
  });

  // Handle action buttons
  actions.forEach(action => {
    const actionId = action.id || action.label.replace(/\s+/g, '-').toLowerCase();
    const btn = overlay.querySelector(`[data-action="${actionId}"]`);
    if (btn) {
      const handler = action.handler || action.onClick;
      if (handler) {
        btn.addEventListener('click', handler);
      }
    }
  });

  return overlay;
}

/**
 * Hide and remove modal
 */
export function hideModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) {
    modal.remove();
  }
}

/**
 * Show confirmation dialog (Promise-based)
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} Resolves with true if confirmed, false if cancelled
 */
export function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    const content = `<p class="confirm-message">${message}</p>`;

    showModal(title, content, {
      actions: [
        {
          id: 'cancel',
          label: 'Cancel',
          class: 'btn-secondary',
          handler: () => {
            hideModal();
            resolve(false);
          }
        },
        {
          id: 'confirm',
          label: 'Confirm',
          class: 'btn-danger',
          handler: () => {
            hideModal();
            resolve(true);
          }
        }
      ]
    });
  });
}

/**
 * Show success message modal
 * @param {string} message - Success message
 */
export function showSuccessModal(message) {
  const content = `<p class="success-message">${message}</p>`;

  showModal('Success', content, {
    actions: [
      {
        id: 'ok',
        label: 'OK',
        class: 'btn-primary',
        handler: hideModal
      }
    ]
  });
}

/**
 * Show error message modal
 * @param {string} message - Error message
 */
export function showErrorModal(message) {
  const content = `<p class="error-message">${message}</p>`;

  showModal('Error', content, {
    actions: [
      {
        id: 'ok',
        label: 'OK',
        class: 'btn-primary',
        handler: hideModal
      }
    ]
  });
}

export default {
  showModal,
  hideModal,
  showConfirmDialog,
  showSuccessModal,
  showErrorModal,
};
