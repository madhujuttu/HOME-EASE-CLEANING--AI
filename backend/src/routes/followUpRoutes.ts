import { Router } from 'express';
import {
  getFollowUps,
  getFollowUpById,
  createFollowUp,
  updateFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  cancelFollowUp,
  deleteFollowUp
} from '../controllers/followUpController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', getFollowUps);
router.get('/:id', getFollowUpById);
router.post('/', logAuditEvent('Schedule Follow-Up', 'Follow-Up Intelligence'), createFollowUp);
router.put('/:id', logAuditEvent('Update Follow-Up', 'Follow-Up Intelligence'), updateFollowUp);
router.patch('/:id', logAuditEvent('Update Follow-Up', 'Follow-Up Intelligence'), updateFollowUp);
router.patch('/:id/reschedule', logAuditEvent('Reschedule Follow-Up', 'Follow-Up Intelligence'), rescheduleFollowUp);
router.post('/:id/reschedule', logAuditEvent('Reschedule Follow-Up', 'Follow-Up Intelligence'), rescheduleFollowUp);
router.patch('/:id/complete', logAuditEvent('Complete Follow-Up', 'Follow-Up Intelligence'), completeFollowUp);
router.post('/:id/complete', logAuditEvent('Complete Follow-Up', 'Follow-Up Intelligence'), completeFollowUp);
router.patch('/:id/cancel', logAuditEvent('Cancel Follow-Up', 'Follow-Up Intelligence'), cancelFollowUp);
router.post('/:id/cancel', logAuditEvent('Cancel Follow-Up', 'Follow-Up Intelligence'), cancelFollowUp);
router.delete('/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Delete Follow-Up', 'Follow-Up Intelligence'), deleteFollowUp);

export default router;
