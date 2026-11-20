import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { isConnected } from './config/db.js';

dotenv.config();

export const app: Express = express();

// Security Middlewares with Cross-Origin Resource Policy for serving uploaded images
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Body Parsing & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static files for uploaded service images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate Limiter on API routes
app.use('/api', apiRateLimiter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'HomeEase Guru AI CRM API Engine',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'CONNECTED (MongoDB)' : 'HYBRID IN-MEMORY (Ready for Live Atlas)',
    aiEngine: 'ACTIVE (Aria & Orion Voice Telephony + Gemini RAG)',
    version: '1.0.0'
  });
});

// REST API Routes (supports both /api and /api/v1)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 404 Catch-All
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
