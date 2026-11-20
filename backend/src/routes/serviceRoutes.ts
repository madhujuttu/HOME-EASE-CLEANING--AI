import { Router } from 'express';
import {
  getServices,
  getCategories,
  createService,
  updateService,
  deleteService,
  uploadServiceImage,
  serviceImageUpload
} from '../controllers/serviceController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', getServices);
router.get('/categories', getCategories);

router.use(authenticate);

// Service Image Upload endpoint
router.post(
  '/upload-image',
  authorizeRoles('admin', 'manager'),
  serviceImageUpload.single('image'),
  uploadServiceImage
);

router.post('/', authorizeRoles('admin', 'manager'), logAuditEvent('Create Service', 'Service Catalog'), createService);
router.put('/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Update Service', 'Service Catalog'), updateService);
router.patch('/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Update Service', 'Service Catalog'), updateService);
router.delete('/:id', authorizeRoles('admin', 'manager'), logAuditEvent('Delete Service', 'Service Catalog'), deleteService);

export default router;
