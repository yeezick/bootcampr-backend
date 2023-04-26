import { Router } from 'express';
import authRoutes from './user/auth.js';
import userRoutes from './user/users.js';
import notificationRoutes from './user/notifications.js';
import projectRoutes from './project/projects.js';
import taskRoutes from './project/tasks.js';
import availabilityRoutes from './calendar/availability.js';
import meetingRoutes from './calendar/meetings.js';
import chatRoutes from './chats.js';
const router = Router();

// would it be better to append "/user" or "/chat" etc. to the routes here instead?
router.get('/', (req, res) => res.send('api root'));
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', projectRoutes);
router.use('/', notificationRoutes);
router.use('/', availabilityRoutes);
router.use('/', chatRoutes);
router.use('/', meetingRoutes);
router.use('/', taskRoutes);

export default router;
