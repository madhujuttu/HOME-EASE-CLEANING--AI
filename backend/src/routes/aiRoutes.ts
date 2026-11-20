import { Router } from 'express';
import {
  handleCopilotQuery,
  handleCustomerAssistant,
  scoreLead,
  getAIInsights
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/copilot', logAuditEvent('AI Sales Copilot Query', 'AI Intelligence'), handleCopilotQuery);
router.post('/assistant', logAuditEvent('AI Customer Concierge Query', 'AI Intelligence'), handleCustomerAssistant);
router.post('/score', logAuditEvent('Calculate AI Lead Score', 'AI Intelligence'), scoreLead);
router.get('/insights', getAIInsights);

export default router;
