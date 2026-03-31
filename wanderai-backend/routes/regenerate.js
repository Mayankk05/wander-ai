import express from 'express';
import { regenerateDay, regenerateFull } from '../controllers/regenerate.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { regenLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.post('/:id/day', authMiddleware, regenLimiter, regenerateDay);
router.post('/:id/full', authMiddleware, regenLimiter, regenerateFull);
export default router;
