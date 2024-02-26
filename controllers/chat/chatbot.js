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
  return chatBotId;
};

const getChatBotMessageTemplate = (messageKey, userName) => {
  const messages = {
    iceBreaker: "Let's get to know each other first. Type in your name and whether you like to put pineapple on pizza.",
    userJoinedChat: `${userName} joined the chat.`,
    userLeftChat: `${userName} left the chat.`,
    welcome: 'Welcome to Bootcampr everyone!',
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
