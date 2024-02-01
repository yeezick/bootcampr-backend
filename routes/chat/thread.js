import { Router } from 'express';
import { getUserChatThreads, getUnreadChatsCountByUser } from '../../controllers/chat/thread.js';
const router = Router();

router.get('/chatThreads', getUserChatThreads);
router.get('/chatTreads/unreadCount', getUnreadChatsCountByUser);

export default router;
