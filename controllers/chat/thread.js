import mongoose from 'mongoose';
import dayjs from 'dayjs';
import GroupChat from '../../models/chat/groupChat.js';
import PrivateChat from '../../models/chat/privateChat.js';
import { getUserIdFromToken } from '../auth/auth.js';

// this page for a general controller for both private and group chats
const getThreadFields = async (chatModel, userId) => {
  const privateChatFields = '_id participants chatType lastActive lastMessage';
  const groupChatFields =
    '_id participants groupName groupDescription groupPhoto chatType lastActive lastMessage isTeamChat';
  const fields = chatModel === GroupChat ? groupChatFields : privateChatFields;

  const threads = await chatModel
    .find({
      participants: {
        $elemMatch: { userInfo: mongoose.Types.ObjectId(userId) },
      },
    })
    .select(fields);
  return threads;
};

export const getReceiverParticipants = async (chatRoomId, senderId, chatType) => {
  const ChatModel = chatType === 'group' ? GroupChat : PrivateChat;
  const chatRoom = await ChatModel.findById(chatRoomId);
  return chatRoom.participants.filter((p) => p.userInfo.toString() !== senderId).map((p) => p.userInfo);
};

export const markMessagesAsRead = async (chatRoomId, chatType, userId) => {
  const chatModel = chatType === 'group' ? GroupChat : PrivateChat;
  try {
    await chatModel.updateOne(
      { _id: chatRoomId },
      { $set: { 'participants.$[elem].hasUnreadMessage': false } },
      {
        arrayFilters: [{ 'elem.userInfo': mongoose.Types.ObjectId(userId) }],
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
      let timestampA = dayjs(a.lastMessage.timestamp).toISOString();
      let timestampB = dayjs(b.lastMessage.timestamp).toISOString();

      return timestampB - timestampA;
    });
    res.json(chatThreads);
  } catch (error) {
    console.error('Error in get user chats: ', error);
    res.status(500).send(error);
  }
};
