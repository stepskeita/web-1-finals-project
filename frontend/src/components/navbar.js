/**
 * Navigation Bar Component
 * Handles navigation and logout functionality
 */

import { logout, getUser, isAdmin } from '../services/auth.service.js';

/**
 * Initialize navigation bar
 */
export function initNavbar() {
  const user = getUser();

  // Make brand link auth-aware
  const brandLink = document.getElementById('brand-link');
  if (brandLink && user) {
    brandLink.href = '/dashboard.html';
  }

  if (!user) {
    // For public pages, show login/register
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement && !window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
      userInfoElement.innerHTML = `
        <div class="user-details">
          <a href="/login.html" class="btn btn-sm btn-outline">Login</a>
          <a href="/register.html" class="btn btn-sm btn-primary">Register</a>
        </div>
      `;
    }
  } else {
    // Display user info with logout button
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
      const roleClass = user.role === 'admin' ? 'admin' : 'collector';
      userInfoElement.innerHTML = `
        <div class="user-details">
          <span class="user-name">${user.name}</span>
          <span class="user-role badge-${roleClass}">${user.role}</span>
          <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
        </div>
      `;

      // Setup logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();

          const confirmed = confirm('Are you sure you want to logout?');
          if (confirmed) {
            logout();
          }
        });
      }
    }

    // Hide admin-only links for non-admins
    if (!isAdmin()) {
      const adminLinks = document.querySelectorAll('.admin-only');
      adminLinks.forEach(link => link.style.display = 'none');
    }
  }

  // Initialize mobile menu toggle
  initMobileMenuToggle();

  // Highlight active page
  highlightActivePage();
}

/**
 * Highlight active page in navigation
 */
function highlightActivePage() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenuToggle() {
  // Create mobile menu toggle button if it doesn't exist
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let toggleBtn = document.getElementById('mobile-menu-toggle');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'mobile-menu-toggle';
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;

    // Append to navbar (will be positioned with CSS order)
    navbar.appendChild(toggleBtn);
  }

  const navMenu = document.querySelector('.navbar-menu');
  if (!navMenu) return;

  // Toggle menu on button click
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

    toggleBtn.classList.toggle('active');
    navMenu.classList.toggle('mobile-active');

    toggleBtn.setAttribute('aria-expanded', !isExpanded);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target) && navMenu.classList.contains('mobile-active')) {
      toggleBtn.classList.remove('active');
      navMenu.classList.remove('mobile-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking a nav link
  const navLinks = document.querySelectorAll('.navbar-menu .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('active');
      navMenu.classList.remove('mobile-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 767) {
        toggleBtn.classList.remove('active');
        navMenu.classList.remove('mobile-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }, 250);
  });
}

/**
 * Update notification badge
 * @param {number} count - Number of notifications
 */
export function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

export default {
  initNavbar,
  updateNotificationBadge,
};
