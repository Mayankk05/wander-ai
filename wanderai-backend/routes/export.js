import express from 'express';
import { exportTripPDF } from '../controllers/export.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
router.get('/:id/pdf', optionalAuth, exportTripPDF);
export default router;
