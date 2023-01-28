import { Router } from 'express';
import userRoutes from './users.js';
import projectRoutes from './projects.js';
import toolRoutes from './tools.js';
import notificationRoutes from './notifications.js';
const router = Router();

router.get('/', (req, res) => res.send('api root'));
router.use('/', userRoutes);
router.use('/', projectRoutes);
router.use('/', toolRoutes);
router.use('/', notificationRoutes);

export default router;
