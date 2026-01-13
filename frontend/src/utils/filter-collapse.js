/**
 * Filter Collapse Utility
 * Adds collapsible functionality to filter sections on mobile
 */

/**
 * Initialize collapsible filters
 * @param {string} filterSectionId - ID of the filters section
 * @param {Object} options - Configuration options
 */
export function initCollapsibleFilters(filterSectionId, options = {}) {
  const {
    collapseOnMobile = true,
    breakpoint = 767,
    buttonText = 'Filters',
    expandedText = 'Hide Filters',
  } = options;

  const filterSection = document.getElementById(filterSectionId);
  if (!filterSection) return;

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'filter-toggle-btn';
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.innerHTML = `
    <span class="filter-toggle-text">${buttonText}</span>
    <svg class="filter-toggle-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>
  `;

  // Find or create filters container
  const filtersContainer = filterSection.querySelector('.filters-container');
  if (!filtersContainer) return;

  // Wrap filters in collapsible div
  const filterWrapper = document.createElement('div');
  filterWrapper.className = 'filter-collapsible-wrapper';

  const filterContent = document.createElement('div');
  filterContent.className = 'filter-collapsible-content';

  // Move all filter elements into the collapsible content
  while (filtersContainer.firstChild) {
    filterContent.appendChild(filtersContainer.firstChild);
  }

  filterWrapper.appendChild(filterContent);
  filtersContainer.appendChild(toggleBtn);
  filtersContainer.appendChild(filterWrapper);

  // Toggle functionality
  function toggleFilters() {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    toggleBtn.classList.toggle('active');
    filterWrapper.classList.toggle('expanded');

    const text = !isExpanded ? expandedText : buttonText;
    toggleBtn.querySelector('.filter-toggle-text').textContent = text;
  }

  toggleBtn.addEventListener('click', toggleFilters);

  // Check if mobile on load and resize
  function checkMobile() {
    const isMobile = window.innerWidth <= breakpoint;

    if (collapseOnMobile && isMobile) {
      toggleBtn.style.display = 'flex';
      if (!filterWrapper.classList.contains('expanded')) {
        filterWrapper.style.maxHeight = '0';
      }
    } else {
      toggleBtn.style.display = 'none';
      filterWrapper.style.maxHeight = 'none';
      filterWrapper.classList.add('expanded');
    }
  }

  checkMobile();
  window.addEventListener('resize', checkMobile);
}

/**
 * Initialize multiple filter sections
 * @param {Array} sections - Array of section IDs
 * @param {Object} options - Configuration options
 */
export function initMultipleFilters(sections, options = {}) {
  sections.forEach(sectionId => {
    initCollapsibleFilters(sectionId, options);
  });
}
