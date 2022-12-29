import { Router } from 'express';
import * as controllers from '../controllers/notifications.js';

const router = Router();
router.get('/notificationz', controllers.getAllNotifications);
router.patch('/notifications', controllers.markNotificationAsRead);

export default router;
