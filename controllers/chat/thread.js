import mongoose from 'mongoose';
import GroupChat from '../../models/chat/groupChat.js';
import PrivateChat from '../../models/chat/privateChat.js';
import { getUserIdFromToken } from '../auth/auth.js';

// this page for a general controller for both private and group chats
const getThreadFields = async (chatModel, userId) => {
  const privateChatFields = '_id participants chatType lastActive lastMessage';
  const groupChatFields = '_id participants groupName groupDescription groupPhoto chatType lastActive lastMessage';
  const fields = chatModel === GroupChat ? groupChatFields : privateChatFields;

  const threads = await chatModel
    .find({
      participants: {
        $elemMatch: { participant: mongoose.Types.ObjectId(userId) },
      },
    })
    .select(fields)
    .populate({ path: 'lastMessage.sender', select: 'firstName lastName' })
    .populate({
      path: 'participants.participant',
      select: 'email firstName lastName profilePicture',
    });

  return threads;
};

const getUnreadCountForCollection = async (chatModel, userId) => {
  const unreadChats = await chatModel
    .find({
      participants: {
        $elemMatch: {
          participant: mongoose.Types.ObjectId(userId),
          hasUnreadMessage: true,
        },
      },
    })
    .lean();
  return unreadChats.length;
};
//get total unread message count
export const getTotalUnreadCount = async (userId) => {
  const privateChatsUnreadCount = await getUnreadCountForCollection(PrivateChat, userId);
  const groupChatsUnreadCount = await getUnreadCountForCollection(GroupChat, userId);
  const totalUnreadCount = privateChatsUnreadCount + groupChatsUnreadCount;
  return totalUnreadCount;
};

export const getReceiverParticipants = async (chatRoomId, senderId, chatType) => {
  const ChatModel = chatType === 'group' ? GroupChat : PrivateChat;
  const chatRoom = await ChatModel.findById(chatRoomId);
  return chatRoom.participants.filter((p) => p.participant.toString() !== senderId).map((p) => p.participant);
};

export const markMessagesAsRead = async (chatRoomId, chatType, userId) => {
  const chatModel = chatType === 'group' ? GroupChat : PrivateChat;
  try {
    await chatModel.updateOne(
      { _id: chatRoomId },
      { $set: { 'participants.$[elem].hasUnreadMessage': false } },
      {
        arrayFilters: [{ 'elem.participant': mongoose.Types.ObjectId(userId) }],
      },
    );
  } catch (error) {
    console.error('Error in markMessagesAsRead: ', error);
    res.status(500).send(error);
  }
};
//endpoint controllers
export const getUserChatThreads = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);

    const groupChats = await getThreadFields(GroupChat, userId);
    const privateChats = await getThreadFields(PrivateChat, userId);

    const chatThreads = [...groupChats, ...privateChats];
    chatThreads.sort((a, b) => {
      let timestampA = new Date(a.lastMessage.timestamp);
      let timestampB = new Date(b.lastMessage.timestamp);

      return timestampB - timestampA;
    });
    res.json(chatThreads);
  } catch (error) {
    console.error('Error in get user chats: ', error);
    res.status(500).send(error);
  }
};

export const getUnreadChatsCountByUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const totalUnreadCount = await getTotalUnreadCount(userId);
    res.json({ count: totalUnreadCount });
  } catch (error) {
    console.error('Error in unread chats count: ', error);
    res.status(500).send(error);
  }
};
