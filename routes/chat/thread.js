import { Router } from 'express';
import { getUserChatThreads } from '../../controllers/chat/thread.js';
const router = Router();

router.get('/chatThreads', getUserChatThreads);

export default router;
