import express from 'express';
import { enableShare, disableShare, getSharedTrip } from '../controllers/share.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/enable', authMiddleware, enableShare);
router.post('/:id/disable', authMiddleware, disableShare);
router.get('/:token', getSharedTrip);

export default router;
