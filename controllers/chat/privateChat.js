import mongoose from 'mongoose';
import PrivateChat from '../../models/chat/privateChat.js';
import { getUserIdFromToken } from '../auth/auth.js';
export const createOrGetPrivateChatRoom = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    let { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        message: 'Participant ID is required in the request body.',
      });
    }

    const existingPrivateChat = await PrivateChat.findOne({
      $or: [
        {
          participants: {
            $all: [
              { $elemMatch: { participant: mongoose.Types.ObjectId(userId) } },
              { $elemMatch: { participant: mongoose.Types.ObjectId(recipientId) } },
            ],
          },
        },
        {
          participants: {
            $all: [
              { $elemMatch: { participant: mongoose.Types.ObjectId(recipientId) } },
              { $elemMatch: { participant: mongoose.Types.ObjectId(userId) } },
            ],
          },
        },
      ],
    })
      .populate({ path: 'lastMessage.sender', select: 'firstName lastName' })
      .populate({
        path: 'participants.participant',
        select: 'email firstName lastName profilePicture',
      })
      .populate({ path: 'messages.sender', select: 'email firstName lastName' });

    if (!existingPrivateChat) {
      // If no existing chat room, create a new one
      const newPrivateThread = new PrivateChat({
        participants: [
          { participant: mongoose.Types.ObjectId(userId) },
          { participant: mongoose.Types.ObjectId(recipientId) },
        ],
      });

      await newPrivateThread.save();
      return res.status(201).json({
        chatRoom: newPrivateThread,
        message: `Successfully created a new private chat room between users with ID ${userId} and ${recipientId}.`,
      });
    }

    // If a chat room already exists, return it
    return res.status(200).json({
      chatRoom: existingPrivateChat,
      message: `Chat room between users with ID ${userId} and ${recipientId} already exists.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createPrivateChatMessage = async (req, res) => {
  try {
    const { privateChatId } = req.params;
    const authHeader = req.headers.authorization;
    const userId = getUserIdFromToken(authHeader);
    let { text } = req.body;

    const existingMessageThread = await PrivateChat.findOne({ _id: privateChatId });
    existingMessageThread.participants.forEach((pp) => {
      if (pp.participant._id.toString() !== userId) {
        pp.hasUnreadMessage = true;
      } else {
        pp.hasUnreadMessage = false;
      }
    });
    existingMessageThread['messages'].push({
      text: text,
      sender: mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    });
    existingMessageThread['lastMessage'] = {
      text: text,
      sender: mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    };
    await existingMessageThread.save();

    res.status(201).json({
      message: `Successfully sent message from user with ID ${userId} to private chat ${privateChatId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPrivateMessages = async (req, res) => {
  try {
    const { privateChatId } = req.params;
    const messageThread = await PrivateChat.find({
      _id: privateChatId,
    })
      .select('participants messages.text messages.sender messages.timestamp messages.status')
      .populate({ path: 'messages.sender', select: 'email profilePicture' });

    const messages = messageThread[0].messages;
    messages.sort((a, b) => {
      const aDate = a.createdAt || a.timestamp;
      const bDate = b.createdAt || b.timestamp;
      return new Date(aDate) - new Date(bDate);
    });
    res.status(200).json({
      messages,
      message: `Successfully retrieved all messages in private chat thread ${privateChatId}.`,
    });
  } catch (error) {
    console.error('Error in get private chat: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessageThread = async (req, res) => {
  try {
    const { privateChatId } = req.params;
    const deletedMessageThread = await PrivateChat.findByIdAndDelete(privateChatId);

    !deletedMessageThread
      ? res.status(404).json({
          message: `Could not find message thread with ID ${privateChatId}.`,
        })
      : res.status(200).json({
          message: `Successfully deleted private message thread with ID ${privateChatId}.`,
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
