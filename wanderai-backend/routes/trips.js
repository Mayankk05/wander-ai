import express from 'express';
import { 
  getAllTrips, 
  createTrip, 
  getTripById, 
  updateTrip, 
  deleteTrip,
  refreshTripImage,
  undoLastChange
} from '../controllers/trips.controller.js';
import { 
  createTripSchema, 
  updateTripSchema,
  aiGenerateSchema 
} from '../lib/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateLimiter, regenLimiter } from '../middleware/rateLimiter.js';
import { generateTrip } from '../controllers/ai.controller.js';

const router = express.Router();

router.get('/generate', authMiddleware, validate(aiGenerateSchema, 'query'), generateLimiter, generateTrip);

router.get('/', authMiddleware, getAllTrips);
router.post('/', authMiddleware, validate(createTripSchema), createTrip);
router.get('/:id', authMiddleware, getTripById);
router.put('/:id', authMiddleware, validate(updateTripSchema), updateTrip);
router.delete('/:id', authMiddleware, deleteTrip);
router.post('/:id/refresh-image', authMiddleware, regenLimiter, refreshTripImage);
router.post('/:id/undo', authMiddleware, regenLimiter, undoLastChange);

export default router;
