import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  envPrefix: 'VITE_',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        prices: resolve(__dirname, 'prices.html'),
        priceSubmission: resolve(__dirname, 'price-submission.html'),
        manageProducts: resolve(__dirname, 'manage-products.html'),
        manageMarkets: resolve(__dirname, 'manage-markets.html'),
      },
    },
  },
});
