import './style.css';
import { initNavbar } from './components/navbar.js';

console.log('Gambia Market Intelligence System (GMIS) initialized');
console.log('Visit /login.html to get started');

// Initialize navbar on landing page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  initNavbar();
}
