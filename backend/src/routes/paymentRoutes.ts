import { Router } from 'express';
import {
  getPayments,
  createPayment,
  refundPayment
} from '../controllers/paymentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);
router.post('/', logAuditEvent('Process Payment', 'Financial Clearing'), createPayment);
router.post('/:id/refund', authorizeRoles('admin'), logAuditEvent('Execute Merchant Refund', 'Financial Clearing'), refundPayment);

export default router;
