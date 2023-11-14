import { Router } from 'express';

import authRoutes from './user/auth.js';
import availabilityRoutes from './calendar/availability.js';
import calendarRoutes from './calendar/calendars.js';
import eventRoutes from './calendar/events.js';
import groupChatRoutes from './chat/groupChat.js';
import mediaRoutes from './chat/media.js';
import notificationRoutes from './user/notifications.js';
import privateChatRoutes from './chat/privateChat.js';
import projectRoutes from './project/projects.js';
import taskRoutes from './project/tasks.js';
import ticketsRoutes from './tickets.js';
import userRoutes from './user/users.js';
const router = Router();

//TODO: these routes need to be updated with more semantic routes
// change ticket status currently fails because groupChatRoutes catches the /updateTicket/status route
// would it be better to append "/user" or "/chat" etc. to the routes here instead?
router.get('/', (req, res) => res.send('api root'));
router.use('/', authRoutes);
router.use('/', availabilityRoutes);
router.use('/', calendarRoutes);
router.use('/', eventRoutes);
// router.use('/', groupChatRoutes);
router.use('/', mediaRoutes);
router.use('/', notificationRoutes);
router.use('/', privateChatRoutes);
router.use('/', projectRoutes);
router.use('/', taskRoutes);
router.use('/', ticketsRoutes);
router.use('/', userRoutes);

export default router;
