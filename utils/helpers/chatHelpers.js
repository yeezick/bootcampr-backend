import mongoose from 'mongoose';
import GroupChat from '../../models/chat/groupChat.js';
import User from '../../models/user.js';
import { createBotMessage, fetchChatBot } from '../../controllers/chat/chatbot.js';
import { sendChatInvite } from '../../controllers/auth/emailVerification.js';

export const saveNewGroupChat = async (participantIds, isTeamChat, creatorId) => {
  const groupName = isTeamChat ? 'Team Chat' : '';
  const participantsWithoutAuthUser = participantIds.filter((participantId) => participantId !== creatorId);
  const emailReceiverIds = isTeamChat ? participantIds : participantsWithoutAuthUser;

  //checking if the chat creater is auth or bot and if the participant is auth
  const participants = participantIds.map((participantId) => ({
    userInfo: mongoose.Types.ObjectId(participantId),
    isAdmin: participantId === creatorId,
    hasUnreadMessage: participantId !== creatorId,
  }));

  const newGroupChat = new GroupChat({
    groupName,
    participants: participants,
    creator: creatorId,
    isTeamChat: isTeamChat,
  });

  if (isTeamChat) {
    await addTeamChatMessages(newGroupChat);
  }

  for (const participantId of emailReceiverIds) {
    const user = await User.findById(participantId).select('email firstName lastName');
    if (user) {
      if (!isTeamChat) {
        await addJoinGroupChatMessage(user, newGroupChat);
      }
      sendChatInvite(user, newGroupChat._id);
    }
  }

  await newGroupChat.save();

  return newGroupChat;
};

export const addJoinGroupChatMessage = async (user, groupChat) => {
  await fetchChatBot();
  const name = `${user.firstName} ${user.lastName}`;
  const joinedChatMessage = createBotMessage('userJoinedChat', name);
  groupChat.messages.push(joinedChatMessage);
  groupChat.lastMessage = joinedChatMessage;
};

export const addTeamChatMessages = async (teamChat) => {
  await fetchChatBot();
  const welcomeMessage = createBotMessage('welcome');
  const iceBreakerMessage = createBotMessage('iceBreaker');
  teamChat.messages = [...teamChat.messages, welcomeMessage, iceBreakerMessage];
  teamChat.lastMessage = iceBreakerMessage;
};

export const getTeamChat = async (team) => {
  const finalTeamIds = team.map((member) => member._id.toString());
  const chatBotId = await fetchChatBot();
  const teamChat = await saveNewGroupChat(finalTeamIds, true, chatBotId);
  return teamChat;
};
