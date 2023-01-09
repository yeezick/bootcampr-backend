import { Router } from 'express';
import { createRole } from '../controllers/roles';

const router = Router();

// roles
router.post('/projects/:projectId/roles', createRole);

export default router;
