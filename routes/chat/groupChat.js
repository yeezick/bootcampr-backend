import { Router } from 'express';
import {
  createGroupChatMessage,
  createGroupChatRoom,
  deleteGroupChat,
  deleteGroupChatThread,
  deleteMessage,
  getUserGroupChats,
  getGroupChatMessages,
  getAllUsersGroupChats,
  getGroupChatByChatId,
  leaveGroupChat,
  updateGroupChatInfo,
} from '../../controllers/chat/groupChat.js';
import { createMediaMessage, getChatMediaByFileType, getMediaMessage } from '../../controllers/chat/media.js';
const router = Router();

router.get('/groupChats', getAllUsersGroupChats);
router.get('/groupChats/:groupChatId', getGroupChatByChatId);
router.get('/groupChats/:groupChatId/messages', getGroupChatMessages);
router.delete('/groupChats/:groupChatId', deleteGroupChat);
router.delete('/groupChats/:groupChatId/messages', deleteMessage);
//user's group chats
//ASK - instead of getting user id from endpoint we can get it from token to avoid  /users/userId/chats/id etc.. but not sure which is better
router.get('/user/groupChats', getUserGroupChats);
router.post('/user/groupChats', createGroupChatRoom);
router.post('/user/groupChats/:groupChatId/messages', createGroupChatMessage);
router.put('/user/groupChats/:groupChatId', updateGroupChatInfo);
//ASK - not sure about this endpoint, we're extracting userId from headers, also should we use delete instead of put?
router.put('/groupChats/:groupChatId/participants/me', leaveGroupChat);
router.delete('/user/groupChats/:groupChatId', deleteGroupChatThread);

// Media Messages
router.get('/groupChats/:groupChatId/media', getMediaMessage);
router.get('/groupChats/:groupChatId/media?type=fileType', getChatMediaByFileType);
router.post('/user/groupChats/:groupChatId/media', createMediaMessage);

export default router;
