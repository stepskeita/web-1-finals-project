import express from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
  getMarketsByCity,
  getMarketsByType,
  addProductToMarket,
  removeProductFromMarket,
} from '../controllers/marketController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view markets
router.get('/', getAllMarkets);
router.get('/city/:city', getMarketsByCity);
router.get('/type/:type', getMarketsByType);
router.get('/:id', getMarketById);

// Protected routes - require authentication
// Any authenticated user can create markets
router.post('/', authMiddleware, createMarket);

// Update and delete require user to be manager or admin
router.put('/:id', authMiddleware, updateMarket);
router.delete('/:id', authMiddleware, deleteMarket);

// Product management in market - manager or admin only
router.post('/:id/products', authMiddleware, addProductToMarket);
router.delete('/:id/products/:productId', authMiddleware, removeProductFromMarket);

export default router;
