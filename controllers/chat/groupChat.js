import mongoose from 'mongoose';
import dayjs from 'dayjs';
import GroupChat from '../../models/chat/groupChat.js';
import User from '../../models/user.js';
import { sendChatInvite } from '../auth/emailVerification.js';
import { getUserIdFromToken } from '../auth/auth.js';
import { createBotMessage, fetchChatBot } from './chatbot.js';

export const createGroupChatRoom = async (req, res) => {
  try {
    let { participantIds, isTeamChat = false } = req.body;
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const chatBotId = await fetchChatBot();
    const groupName = isTeamChat ? 'Team Chat' : '';
    const creatorId = isTeamChat ? chatBotId : mongoose.Types.ObjectId(userId);

    const participants = participantIds.map((participantId) => ({
      userInfo: mongoose.Types.ObjectId(participantId),
      isAdmin: isTeamChat ? false : participantId === userId,
      hasUnreadMessage: isTeamChat ? true : participantId !== userId,
    }));

    const newGroupChat = new GroupChat({
      groupName,
      participants: participants,
      creator: creatorId,
    });

    if (isTeamChat) {
      const welcomeMessage = createBotMessage('welcome');
      const iceBreakerMessage = createBotMessage('iceBreaker');
      newGroupChat.messages = [...newGroupChat.messages, welcomeMessage, iceBreakerMessage];
      newGroupChat.lastMessage = iceBreakerMessage;
    }

    const participantsWithoutAuthUser = participantIds.filter((participantId) => participantId !== userId);
    const emailReceiverIds = isTeamChat ? participantIds : participantsWithoutAuthUser;

    for (const participantId of emailReceiverIds) {
      const user = await User.findById(participantId).select('email firstName');
      if (user) {
        sendChatInvite(user, newGroupChat._id);
      }
    }

    await newGroupChat.save();
    res.status(201).json({
      chatRoom: newGroupChat,
      message: `Group chat created successfully by user with ID ${userId}.`,
    });
  } catch (error) {
    console.error('Error in create group chat: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createGroupChatMessage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const { groupChatId } = req.params;
    let { text } = req.body;
    const existingGroupChat = await GroupChat.findOne({ _id: groupChatId });
    existingGroupChat.participants.forEach((pp) => {
      if (pp.userInfo._id.toString() !== userId) {
        pp.hasUnreadMessage = true;
      } else {
        pp.hasUnreadMessage = false;
      }
    });
    existingGroupChat['messages'].push({
      text: text,
      sender: mongoose.Types.ObjectId(userId),
      timestamp: dayjs().toDate(),
    });
    existingGroupChat['lastMessage'] = {
      text: text,
      sender: mongoose.Types.ObjectId(userId),
      timestamp: dayjs().toDate(),
    };
    await existingGroupChat.save();
    res.status(201).json({
      message: `Successfully sent message from user with ID ${userId} to group chat ${groupChatId}.`,
    });
  } catch (error) {
    console.error('Error in create group chat message: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupChatMessages = async (req, res) => {
  try {
    const { groupChatId } = req.params;
    const messageThread = await GroupChat.find({
      _id: groupChatId,
    }).select('messages.text messages.sender messages.isBotMessage messages.timestamp messages.status');

    const messages = messageThread[0].messages;
    messages.sort((a, b) => {
      const aDate = a.createdAt || a.timestamp;
      const bDate = b.createdAt || b.timestamp;
      return dayjs(aDate).toISOString() - dayjs(bDate).toISOString();
    });

    res.status(200).json({
      messages,
      message: `Successfully retrieved all messages in group chat thread ${groupChatId}.`,
    });
  } catch (error) {
    console.error('Error in get group chat message: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateGroupChat = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const { groupChatId } = req.params;
    const groupChat = await GroupChat.findOne({ _id: groupChatId }).populate('participants');

    const user = groupChat.participants.find((participant) => participant.userInfo._id.toString() === userId);
    if (user && user.isAdmin === true) {
      const updatedData = {
        ...req.body,
        participants: [
          ...(groupChat.participants || []),
          ...(req.body.participants || []).map((id) => ({
            userInfo: mongoose.Types.ObjectId(id),
          })),
        ],
      };
      const updatedGroupChat = await GroupChat.findByIdAndUpdate({ _id: groupChatId }, updatedData, { new: true });
      if (!updatedGroupChat) {
        return res.status(404).json({ message: `Group chat with ID ${groupChatId} not updated.` });
      }
      return res.status(201).json({
        message: `Group chat with ID ${groupChatId} successfully updated.`,
      });
    }
    return res.status(403).json({
      message: `User does not have admin privileges to update group chat.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateGroupChatParticipants = async (req, res) => {
  try {
    const { groupChatId } = req.params;
    const participantIds = req.body;
    const groupChat = await GroupChat.findById(groupChatId);
    await fetchChatBot();

    if (!groupChat) {
      return res.status(404).send('Group chat not found');
    }

    for (const participantId of participantIds) {
      const user = await User.findById(participantId).select('email firstName lastName profilePicture');
      const userIsAlreadyParticipant = groupChat.participants.some((p) => p.userInfo._id.equals(user._id));

      if (user && !userIsAlreadyParticipant) {
        const name = `${user.firstName} ${user.lastName}`;
        const joinedChatMessage = createBotMessage('userJoinedChat', name);

        groupChat.participants.push({
          userInfo: user,
          isAdmin: false,
          hasUnreadMessage: true,
        });
        groupChat['messages'].push(joinedChatMessage);
        groupChat['lastMessage'] = joinedChatMessage;
        // sendChatInviteEmail(user.project, user.email, user.firstName);
      }
    }

    await groupChat.save();

    res.status(201).json({
      chatRoom: groupChat,
      message: `Participants updated successfully.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroupChatThread = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const { groupChatId } = req.params;
    const groupChat = await GroupChat.findOne({ _id: groupChatId });
    if (!groupChat)
      return res.status(404).json({
        message: `Could not find group chat thread with ID ${groupChatId}.`,
      });

    const user = groupChat.participants.find((participant) => participant.userInfo._id.toString() === userId);
    if (!user) return res.status(403).json({ message: `User is not a participant of the group chat.` });

    if (user.userInfo._id.toString() !== groupChat.creator._id.toString())
      return res.status(403).json({
        message: `User is not the creator of the group chat and cannot delete the thread.`,
      });

    const deletedGroupChatThread = await GroupChat.findByIdAndDelete(groupChatId);
    if (!deletedGroupChatThread)
      return res.status(404).json({
        message: `Could not delete group chat thread with ID ${groupChatId}.`,
      });

    return res.status(200).json({
      message: `Successfully deleted group chat thread with ID ${groupChatId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const leaveGroupChat = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    const { groupChatId } = req.params;

    const updatedChat = await GroupChat.findByIdAndUpdate(
      { _id: groupChatId },
      { $pull: { participants: { userInfo: { _id: userId } } } },
      { new: true },
    );

    if (!updatedChat) {
      return res.status(404).json({ message: `Group chat with ID ${groupChatId} not found.` });
    }
    res.status(200).json({
      message: `User with ID ${userId} successfully left the group chat ${groupChatId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const deletedChat = await GroupChat.findByIdAndDelete(chatId);

    res.status(200).json({ message: 'deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { groupChatId } = req.params;
    const { messageId } = req.body;
    const deletedMessage = await GroupChat.findByIdAndUpdate(
      { _id: groupChatId },
      { $pull: { messages: { _id: messageId } } },
      { new: true },
    );
    res.status(200).json({ message: `Successfully deleted message with ID ${messageId}.` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
