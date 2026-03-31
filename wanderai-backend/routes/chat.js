import express from 'express';
import { chatWithTrip } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id', authMiddleware, chatWithTrip);

export default router;
