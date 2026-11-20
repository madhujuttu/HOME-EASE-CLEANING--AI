import { Router } from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';
import customerRoutes from './customerRoutes.js';
import salesRoutes from './salesRoutes.js';
import meetingRoutes from './meetingRoutes.js';
import callRoutes from './callRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import providerRoutes from './providerRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import aiRoutes from './aiRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import followUpRoutes from './followUpRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/meetings', meetingRoutes);
apiRouter.use('/follow-ups', followUpRoutes);
apiRouter.use('/calls', callRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/providers', providerRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
