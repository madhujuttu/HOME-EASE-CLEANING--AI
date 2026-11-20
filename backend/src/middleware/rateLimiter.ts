import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/index.js';
import { AuthRequest } from './auth.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.'
  }
});

export const logAuditEvent = (action: string, module: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Run after response finishes to avoid blocking request pipeline
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            userRole: req.user.role,
            action,
            module,
            details: `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
            ipAddress: req.ip || req.socket.remoteAddress
          });
        } catch (err: any) {
          // Non-blocking log failure
        }
      }
    });
    next();
  };
};
