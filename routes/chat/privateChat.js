import { Router } from 'express';
import { createMediaMessage, getChatMediaByFileType, getMediaByChatId } from '../../controllers/chat/media.js';
import {
  createPrivateChatMessage,
  createPrivateChatRoom,
  deleteMessageThread,
  getAllMessageThreads,
  getAllPrivateMessages,
  updatePrivateMessageReadStatus,
} from '../../controllers/chat/privateChat.js';
const router = Router();

router.post('/:userId/privateChats', createPrivateChatRoom);
router.post('/:userId/privateChats/:privateChatId', createPrivateChatMessage);
router.get('/:userId/privateChats', getAllMessageThreads);
router.get('/:userId/privateChats/:privateChatId', getAllPrivateMessages);
router.delete('/:userId/privateChats/:privateChatId', deleteMessageThread);
router.put('/users/:userId/privateChats/:privateChatId/lastMessage', updatePrivateMessageReadStatus);

// Media Messages
router.post('/:userId/privateChats/:privateChatId/media', createMediaMessage);
router.get('/privateChats/:privateChatId/media', getMediaByChatId);
router.get('/privateChats/:privateChatId/media/:fileType', getChatMediaByFileType);

export default router;
