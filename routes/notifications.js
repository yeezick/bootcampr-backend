import { Router } from 'express';
import * as controllers from '../controllers/notifications.js';

const router = Router();
router.get('/notifications', controllers.getAllNotifications);
router.patch('/notifications', controllers.markNotificationAsRead);

export default router;
