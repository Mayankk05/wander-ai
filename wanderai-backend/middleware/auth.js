import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const authMiddleware = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Support tokens in query string (primarily for EventSource/SSE)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.userId = decoded.userId;
    req.userEmail = user.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.code = 'TOKEN_EXPIRED';
    } else {
      error.statusCode = 401;
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.split(' ')[1] || req.query.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user) {
      req.userId = decoded.userId;
      req.userEmail = user.email;
    }
    next();
  } catch (error) {
    next();
  }
};
