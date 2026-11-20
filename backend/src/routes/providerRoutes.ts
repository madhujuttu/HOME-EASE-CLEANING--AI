import { Router } from 'express';
import {
  getProviders,
  registerProvider,
  updateProvider
} from '../controllers/providerController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', getProviders);
router.post('/', authorizeRoles('admin', 'manager'), logAuditEvent('Register Provider', 'Provider Fleet'), registerProvider);
router.put('/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Update Provider', 'Provider Fleet'), updateProvider);

export default router;
