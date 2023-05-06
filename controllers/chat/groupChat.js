import mongoose from 'mongoose';
import GroupChat from '../../models/chat/groupChat.js';

export const createGroupChatRoom = async (req, res) => {
  try {
    const { userId } = req.params;
    let { groupName, groupDescription, groupPhoto, participants } = req.body;

    participants = participants.map((participantId) => ({
      participant: mongoose.Types.ObjectId(participantId),
      isAdmin: false,
    }));

    const newGroupChat = new GroupChat({
      groupName,
      groupDescription,
      groupPhoto,
      participants: [{ participant: mongoose.Types.ObjectId(userId), isAdmin: true }, ...participants],
      creator: mongoose.Types.ObjectId(userId),
    });
    await newGroupChat.save();
    res.status(201).json({
      message: `Group chat created successfully by user with ID ${userId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createGroupChatMessage = async (req, res) => {
  try {
    const { userId, groupChatId } = req.params;
    let { text } = req.body;
    const existingGroupChat = await GroupChat.findOne({ _id: groupChatId });

    existingGroupChat['messages'].push({
      text: text,
      sender: mongoose.Types.ObjectId(userId),
    });
    await existingGroupChat.save();
    res.status(201).json({
      message: `Successfully sent message from user with ID ${userId} to group chat ${groupChatId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllGroupChatsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const groupChatThreads = await GroupChat.find({
      'participants.participant': userId,
    })
      .populate({ path: 'participants.participant', select: 'email' })
      .populate({ path: 'creator', select: 'email' })
      .populate({ path: 'messages.sender', select: 'email' });

    if (groupChatThreads.length === 0) {
      return res.status(404).json({
        message: `No group chat threads found for user with ID ${userId}.`,
      });
    }
    res.status(200).json({
      groupChatThreads,
      message: `Successfully retrieved all group chat threads for user with ID ${userId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupChatByChatId = async (req, res) => {
  try {
    const { groupChatId } = req.params;
    const groupChatThread = await GroupChat.findOne({ _id: groupChatId })
      .populate({ path: 'participants.participant', select: 'email' })
      .populate({ path: 'creator', select: 'email' })
      .populate({
        path: 'media',
        select: 'status fileName fileType fileUrl',
        populate: { path: 'sender', select: 'email' },
      })
      .populate({ path: 'messages.sender', select: 'email' });

    !groupChatThread
      ? res.status(404).json({ message: `No group chat found with ID ${groupChatId}.` })
      : res.status(200).json({
          groupChatThread,
          message: `Successfully retrieve group chat thread with ID ${groupChatId}.`,
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllGroupMessages = async (req, res) => {
  try {
    const { userId, groupChatId } = req.params;
    const messageThread = await GroupChat.find({
      _id: groupChatId,
    })
      .select('messages.text messages.sender messages.timestamp messages.status')
      .populate({ path: 'messages.sender', select: 'email profilePicture' })
      .populate({
        path: 'media',
        populate: { path: 'sender', select: 'email profilePicture' },
        select: 'fileName fileType fileUrl status createdAt',
      });

    const combinedMessages = messageThread[0].messages.concat(messageThread[0].media);
    combinedMessages.sort((a, b) => {
      const aDate = a.createdAt || a.timestamp;
      const bDate = b.createdAt || b.timestamp;
      return new Date(aDate) - new Date(bDate);
    });

    combinedMessages.length === 0
      ? res.status(404).json({
          message: `Group messages thread with ID ${groupChatId} not found.`,
        })
      : res.status(200).json({
          combinedMessages,
          message: `Successfully retrieved all messages for user with ID ${userId} in group chat thread ${groupChatId}.`,
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateGroupChatInfo = async (req, res) => {
  try {
    const { userId, groupChatId } = req.params;
    const groupChat = await GroupChat.findOne({ _id: groupChatId }).populate('participants');

    const user = groupChat.participants.find((participant) => participant.participant._id.toString() === userId);

    if (user && user.isAdmin === true) {
      const updatedData = {
        ...req.body,
        participants: [
          ...(groupChat.participants || []),
          ...(req.body.participants || []).map((id) => ({
            participant: mongoose.Types.ObjectId(id),
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

export const deleteGroupChatThread = async (req, res) => {
  try {
    const { userId, groupChatId } = req.params;
    const groupChat = await GroupChat.findOne({ _id: groupChatId });
    if (!groupChat)
      return res.status(404).json({
        message: `Could not find group chat thread with ID ${groupChatId}.`,
      });

    const user = groupChat.participants.find((participant) => participant.participant._id.toString() === userId);
    if (!user) return res.status(403).json({ message: `User is not a participant of the group chat.` });

    if (user.participant._id.toString() !== groupChat.creator._id.toString())
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
    const { userId, groupChatId } = req.params;
    const removedUser = await GroupChat.findByIdAndUpdate(
      { _id: groupChatId },
      { $pull: { participants: { _id: userId } } },
      { new: true },
    );

    if (!removedUser) {
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

export const getAllUsersGroupChats = async (req, res) => {
  try {
    const allGChats = await GroupChat.find({})
      .populate({ path: 'participants.participant', select: 'email' })
      .populate({ path: 'creator', select: 'email' })
      .populate({ path: 'media', select: 'sender fileName fileType fileUrl' });
    !allGChats
      ? res.status(404).json({ message: 'No group chats found.' })
      : res.status(200).json({
          allGChats,
          message: 'Successfully retrieved all group chat threads from database.',
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGChat = async (req, res) => {
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
