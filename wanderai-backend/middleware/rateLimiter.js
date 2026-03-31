import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Generation limit reached. You can generate 10 trips per hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const regenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Action limit reached. Please wait before undoing or refreshing again." },
  standardHeaders: true,
  legacyHeaders: false,
});
