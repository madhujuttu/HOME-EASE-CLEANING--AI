import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  getExecutiveReport
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.put('/:id/read', markRead);
router.patch('/mark-all-read', markAllRead);
router.put('/mark-all-read', markAllRead);
router.patch('/read-all', markAllRead);
router.put('/read-all', markAllRead);
router.get('/executive-report', getExecutiveReport);

export default router;
