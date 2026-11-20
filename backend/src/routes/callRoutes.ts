import { Router } from 'express';
import { getCallLogs, createCallLog } from '../controllers/callController.js';
import { authenticate } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', getCallLogs);
router.post('/', logAuditEvent('Log AI Voice Call', 'AI Telephony'), createCallLog);

export default router;
