import { Router } from 'express';
import userRoutes from './users.js';
import projectRoutes from './projects.js';
import roleRoutes from './roles.js';
import toolRoutes from './tools.js';
import notificationRoutes from './notifications.js';
const router = Router();

// would it be better to append "/user" or "/chat" etc. to the routes here instead?
router.get('/', (req, res) => res.send('api root'));
router.use('/', userRoutes);
router.use('/', projectRoutes);
router.use('/', toolRoutes);
router.use('/', roleRoutes);
router.use('/', notificationRoutes);
router.use('/', availabilityRoutes);
router.use('/', chatRoutes);
router.use('/', meetingRoutes);
router.use('/', taskRoutes);

export default router;
