import express from 'express';
import { getBudgetSummary, optimizeBudget } from '../controllers/budget.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.get('/:id/summary', authMiddleware, getBudgetSummary);
router.post('/:id/optimize', authMiddleware, optimizeBudget);
export default router;
