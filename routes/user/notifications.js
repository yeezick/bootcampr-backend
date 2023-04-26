import { Router } from 'express';
import * as controllers from '../../controllers/user/notifications.js';

const router = Router();
router.get('/notifications', controllers.getAllNotifications);
router.post('/notifications', controllers.saveNotification);
router.delete('/notifications/:_id', controllers.deleteNotification);
router.delete('/delete-notifications/:user', controllers.deleteAllNotifications);
router.patch('/notifications', controllers.markNotificationAsRead);
router.patch('/all-notifications/:user', controllers.markAllNotificationsAsRead);

export default router;
