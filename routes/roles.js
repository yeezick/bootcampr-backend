import { Router } from 'express';
import * as controllers from '../controllers/roles.js';

const router = Router();

// roles
router.post('/projects/:projectId/roles', controllers.createRole);

export default router;
