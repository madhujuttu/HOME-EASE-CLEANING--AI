import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee
} from '../controllers/salesController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', authorizeRoles('admin', 'manager'), logAuditEvent('Create Employee', 'Sales Operations'), createEmployee);
router.put('/employees/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Update Employee', 'Sales Operations'), updateEmployee);

export default router;
