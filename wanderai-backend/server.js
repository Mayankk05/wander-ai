import dotenv from 'dotenv';
dotenv.config(); // MUST BE FIRST - Ensure environment variables are loaded before ALL other imports

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import appLogger from './lib/logger.js';

import authRoutes from './routes/auth.js';
import tripsRoutes from './routes/trips.js';
import shareRoutes from './routes/share.js';
import chatRoutes from './routes/chat.js';
import collabRoutes from './routes/collab.js';
import budgetRoutes from './routes/budget.js';
import regenerateRoutes from './routes/regenerate.js';
import exportRoutes from './routes/export.js';

import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import { checkTripAccess } from './lib/checkTripAccess.js';
import prisma from './lib/prisma.js';

import { initSocket } from './lib/socket.js';
import { geminiClient } from './pipeline/geminiClient.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(pinoHttp({ logger: appLogger }));
app.use((req, res, next) => {
  req.setTimeout(120000, () => {
    if(!res.headersSent) res.status(408).json({ error: "Request timeout" });
  });
  next();
});

const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, "");
    
    // Dynamic local-network passthrough
    const isLocal = normalizedOrigin.includes("localhost") || 
                  normalizedOrigin.includes("127.0.0.1") || 
                  normalizedOrigin.startsWith("http://192.168.") || 
                  normalizedOrigin.startsWith("http://10.");
                   
    if (allowedOrigins.includes(normalizedOrigin) || isLocal) {
      callback(null, true);
    } else {
      appLogger.warn({ origin }, "CORS blocked origin");
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));

app.use(cookieParser());
app.use(express.json({ limit: '512kb' }));
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/collab', collabRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/regenerate', regenerateRoutes);
app.use('/api/export', exportRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    appLogger.error({ err }, "Health check failed");
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: "WanderAI API is running",
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth",
      trips: "/api/trips",
      share: "/api/share",
      chat: "/api/chat",
      collab: "/api/collab",
      budget: "/api/budget",
      regenerate: "/api/regenerate",
      export: "/api/export",
      aiStatus: "/api/ai-status"
    }
  });
});

app.get('/api/ai-status', (req, res) => {
  const models = geminiClient.getStatus();
  const available = models.filter(m => m.status === 'available').length;
  res.json({
    summary: `${available}/${models.length} models available`,
    models
  });
});

app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  appLogger.info({ port: PORT, host: '0.0.0.0' }, "Server listener activated successfully");
});

process.on('unhandledRejection', (err) => {
  appLogger.fatal({ err }, "Unhandled Promise Rejection");
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  appLogger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});
