import dayjs from 'dayjs';
import User from '../../models/user.js';

let chatBotId = null;

const getChatBot = async () => {
  const chatBot = await User.findOne({ email: 'bootcampr@admin.com' }).select('_id');
  return chatBot;
};

export const fetchChatBot = async () => {
  const chatBot = await getChatBot();
  chatBotId = chatBot._id;
};

const getChatBotMessageTemplate = (messageKey, userId) => {
  const messages = {
    welcome: 'Welcome to Bootcampr everyone!',
    iceBreaker: "Let's get to know each other first. Type in your name and whether you like to put pineapple on pizza.",
    joinedChat: `${userId} joined the chat.`,
    leftChat: `${userId} left the chat.`,
  };
  return messages[messageKey];
};

export const createBotMessage = (messageKey, userId) => {
  const message = getChatBotMessageTemplate(messageKey, userId);
  return {
    isBotMessage: true,
    text: message,
    sender: chatBotId,
    timestamp: dayjs().toDate(),
  };
};
