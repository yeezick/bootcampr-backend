import { Router } from 'express';
import * as controllers from '../controllers/notifications.js';

const router = Router();
router.get('/notifications', controllers.getAllNotifications);
router.post('/notifications', controllers.saveNotification);
router.delete('/notifications', controllers.deleteNotification);
router.delete('/delete-notifications', controllers.deleteAllNotifications);
router.patch('/notifications', controllers.markNotificationAsRead);
router.patch('/all-notifications', controllers.markAllNotificationsAsRead);

export default router;
