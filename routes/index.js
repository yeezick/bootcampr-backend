import { Router } from 'express';

import authRoutes from './user/auth.js';
import availabilityRoutes from './calendar/availability.js';
import calendarRoutes from './calendar/calendars.js';
import commentRoutes from './project/comments.js';
import chatThreadRoutes from './chat/thread.js';
import eventRoutes from './calendar/events.js';
import groupChatRoutes from './chat/groupChat.js';
import mediaRoutes from './chat/media.js';
import notificationRoutes from './user/notifications.js';
import paymentRoutes from './payment.js';
import privateChatRoutes from './chat/privateChat.js';
import projectRoutes from './project/projects.js';
import ticketRoutes from './project/tickets.js';
import userRoutes from './user/users.js';
import serviceRoutes from './service.js';

const router = Router();

//BC-647: these routes need to be updated with more semantic routes
// change ticket status currently fails because groupChatRoutes catches the /updateTicket/status route
// would it be better to append "/user" or "/chat" etc. to the routes here instead?
router.get('/', (req, res) => res.send('api root'));
router.use('/', authRoutes);
router.use('/', availabilityRoutes);
router.use('/', calendarRoutes);
router.use('/', commentRoutes);
router.use('/', chatThreadRoutes);
router.use('/', eventRoutes);
router.use('/', groupChatRoutes);
router.use('/', mediaRoutes);
router.use('/', notificationRoutes);
router.use('/', paymentRoutes);
router.use('/', privateChatRoutes);
router.use('/', projectRoutes);
router.use('/', serviceRoutes);
router.use('/', ticketRoutes);
router.use('/', userRoutes);

export default router;
