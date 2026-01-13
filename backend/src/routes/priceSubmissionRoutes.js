import express from 'express';
import {
  getAllPriceSubmissions,
  getPriceSubmissionById,
  createPriceSubmission,
  updatePriceSubmission,
  deletePriceSubmission,
  getPriceSubmissionsByProduct,
  getPriceSubmissionsByMarket,
  getPriceHistory,
  getAveragePrice,
  verifyPriceSubmission,
  rejectPriceSubmission,
} from '../controllers/priceSubmissionController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view approved submissions
router.get('/', getAllPriceSubmissions);
router.get('/:id', getPriceSubmissionById);
router.get('/product/:productId', getPriceSubmissionsByProduct);
router.get('/market/:marketId', getPriceSubmissionsByMarket);
router.get('/product/:productId/market/:marketId/history', getPriceHistory);
router.get('/product/:productId/average', getAveragePrice);

// Protected routes - require authentication
// Any authenticated user can create price submissions
router.post('/', authMiddleware, createPriceSubmission);

// Update and delete require admin role only
router.put('/:id', authMiddleware, authorize('admin'), updatePriceSubmission);
router.delete('/:id', authMiddleware, authorize('admin'), deletePriceSubmission);

// Admin only routes - verify/reject submissions
router.patch('/:id/verify', authMiddleware, authorize('admin'), verifyPriceSubmission);
router.patch('/:id/reject', authMiddleware, authorize('admin'), rejectPriceSubmission);

export default router;
