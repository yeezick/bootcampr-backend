import { Router } from 'express';
import { createMediaMessage, getChatMediaByFileType, getMediaMessage } from '../../controllers/chat/media.js';
import {
  createPrivateChatMessage,
  createOrGetPrivateChatRoom,
  deleteMessageThread,
  getPrivateMessages,
} from '../../controllers/chat/privateChat.js';
const router = Router();

router.get('/privateChats/:privateChatId/messages', getPrivateMessages);
router.post('/privateChats', createOrGetPrivateChatRoom);
router.post('/privateChats/:privateChatId/messages', createPrivateChatMessage);
// router.delete('/:userId/privateChats/:privateChatId', deleteMessageThread);

// Media Messages
router.post('/:userId/privateChats/:privateChatId/media', createMediaMessage);
router.get('/privateChats/:privateChatId/media', getMediaMessage);
router.get('/privateChats/:privateChatId/media/:fileType', getChatMediaByFileType);

export default router;
