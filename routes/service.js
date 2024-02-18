import { Router } from 'express';
import { getApiVersion } from '../controllers/service.js';

const router = Router();

router.get('/service/version', getApiVersion);

export default router;
