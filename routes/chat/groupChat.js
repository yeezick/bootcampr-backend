import { Router } from 'express';
import {
  createGroupChat,
  createGroupChatMessage,
  deleteGChat,
  deleteGroupChatThread,
  deleteMessage,
  getAllGroupChatsByUserId,
  getAllGroupMessages,
  getAllUsersGroupChats,
  getGroupChatByChatId,
  leaveGroupChat,
  updateGroupChatInfo,
} from '../../controllers/chat/groupChat.js';
import { createMediaMessage, getChatMediaByFileType, getMediaByChatId } from '../../controllers/chat/media.js';
const router = Router();

router.get('/groupChats', getAllUsersGroupChats);
router.post('/:userId/groupChats', createGroupChat);
router.post('/:userId/groupChats/:groupChatId', createGroupChatMessage);
router.get('/:userId/groupChats', getAllGroupChatsByUserId);
router.get('/:userId/groupChats/:groupChatId', getAllGroupMessages);
router.get('/groupChats/:groupChatId', getGroupChatByChatId);
router.put('/:userId/groupChats/:groupChatId', updateGroupChatInfo);
router.delete('/:userId/groupChats/:groupChatId', deleteGroupChatThread);
router.put('/:userId/:groupChatId', leaveGroupChat);
router.delete('/groupChats/:chatId', deleteGChat);
router.delete('/groupChats/:groupChatId/messages', deleteMessage);

// Media Messages
router.post('/:userId/groupChats/:groupChatId/media', createMediaMessage);
router.get('/groupChats/:groupChatId/media', getMediaByChatId);
router.get('/groupChats/:groupChatId/media/:fileType', getChatMediaByFileType);

export default router;
