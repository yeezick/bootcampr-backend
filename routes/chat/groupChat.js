import { Router } from 'express';
import {
  createGroupChatMessage,
  createGroupChatRoom,
  deleteGroupChatThread,
  getGroupChatMessages,
  leaveGroupChat,
  updateGroupChat,
  updateGroupChatParticipants,
} from '../../controllers/chat/groupChat.js';
import { createMediaMessage, getChatMediaByFileType, getMediaMessage } from '../../controllers/chat/media.js';
const router = Router();

router.get('/groupChats/:groupChatId/messages', getGroupChatMessages);
router.post('/groupChats', createGroupChatRoom);
router.post('/groupChats/:groupChatId/messages', createGroupChatMessage);
router.post('/groupChats/:groupChatId/participants', updateGroupChatParticipants);
router.put('/groupChats/:groupChatId', updateGroupChat);

//NOT in HIFI
router.delete('/groupChats/:groupChatId', deleteGroupChatThread);
router.put('/groupChats/:groupChatId/participants/me', leaveGroupChat);

// Media Messages
router.get('/groupChats/:groupChatId/media', getMediaMessage);
router.get('/groupChats/:groupChatId/media?type=fileType', getChatMediaByFileType);
router.post('/groupChats/:groupChatId/media', createMediaMessage);

export default router;
