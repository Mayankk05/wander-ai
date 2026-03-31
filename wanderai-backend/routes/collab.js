import express from 'express';
import { 
  getCollaborators, 
  inviteCollaborator, 
  removeCollaborator,
  leaveTrip 
} from '../controllers/collab.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authMiddleware, getCollaborators);
router.post('/:id/invite', authMiddleware, inviteCollaborator);
router.delete('/:id/:email', authMiddleware, removeCollaborator);
router.post('/:id/leave', authMiddleware, leaveTrip);

export default router;
