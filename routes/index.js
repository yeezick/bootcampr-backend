import { Router } from 'express';

import notificationRoutes from './user/notifications.js';
import ticketsRoutes from './tickets.js';
import authRoutes from './user/auth.js';
import userRoutes from './user/users.js';

import projectRoutes from './project/projects.js';
import taskRoutes from './project/tasks.js';
import availabilityRoutes from './calendar/availability.js';
import meetingRoutes from './calendar/meetings.js';
import chatRoutes from './chats.js';
import privateChatRoutes from './chat/privateChat.js';
import groupChatRoutes from './chat/groupChat.js';
import mediaRoutes from './chat/media.js';
const router = Router();

// would it be better to append "/user" or "/chat" etc. to the routes here instead?
router.get('/', (req, res) => res.send('api root'));
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', projectRoutes);
router.use('/', notificationRoutes);
router.use('/', ticketsRoutes);
router.use('/', availabilityRoutes);
router.use('/', chatRoutes);
router.use('/', privateChatRoutes);
router.use('/', groupChatRoutes);
router.use('/', mediaRoutes);
router.use('/', meetingRoutes);
router.use('/', taskRoutes);
router.use('/', ticketsRoutes);

export default router;
