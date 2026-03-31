import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  verifyEmail, 
  verifyEmailWithLink, 
  sendVerifyLink, 
  forgotPassword, 
  resetPassword, 
  refreshToken,
  getProfile,
  updateProfile
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { 
  registerSchema, 
  loginSchema, 
  profileUpdateSchema 
} from '../lib/schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate(profileUpdateSchema), updateProfile);

router.post('/verify-email', verifyEmail); // Optional: can still be used by frontend
router.get('/verify', verifyEmailWithLink); // Direct link from email
router.get('/send-verify-link', authMiddleware, sendVerifyLink);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
