import mongoose from 'mongoose';
import PrivateChat from '../../models/chat/privateChat.js';
import User from '../../models/user.js';

export const createMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    let { text, email } = req.body;
    const existingUser = await User.findOne({ email }).select('_id');

    if (!existingUser) {
      return res.status(404).json({
        message: `User not found. The email address ${email} doesn't belong to any registered Chatty user. You can invite them to join Chatty and add them as a contact.`,
      });
    }
    const { _id: recipientId } = existingUser;

    const existingMessageThread = await PrivateChat.findOne({
      $and: [{ participants: { $elemMatch: { $eq: userId } } }, { participants: { $elemMatch: { $eq: recipientId } } }],
    });

    if (!existingMessageThread) {
      const newPrivateThread = new PrivateChat({
        participants: [mongoose.Types.ObjectId(userId), mongoose.Types.ObjectId(recipientId)],
        messages: [
          {
            text: text,
            sender: mongoose.Types.ObjectId(userId),
          },
        ],
      });
      await newPrivateThread.save();
      return res.status(201).json({
        message: `New private message thread started between users with ID ${userId} and ${recipientId} successfully.`,
      });
    }

    existingMessageThread['messages'].push({
      text: text,
      sender: mongoose.Types.ObjectId(userId),
    });
    await existingMessageThread.save();
    res.status(201).json({
      message: `Successfully sent message from user with ID ${userId} to user ${recipientId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMessageThreads = async (req, res) => {
  try {
    const { userId } = req.params;
    const messageThreads = await PrivateChat.find({
      participants: { $elemMatch: { $eq: userId } },
    })
      .populate({ path: 'participants', select: 'email' })
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'email' },
      })
      .populate({
        path: 'media',
        populate: { path: 'sender', select: 'email' },
        select: 'fileName fileType fileUrl status',
      });

    if (messageThreads.length === 0) {
      return res.status(404).json({
        message: `No private message threads found for user with ID ${userId}.`,
      });
    }
    res.status(200).json({
      messageThreads,
      message: `Successfully retrieved all private message threads for user with ID ${userId}.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllPrivateMessages = async (req, res) => {
  try {
    const { userId, privateChatId } = req.params;
    const messageThread = await PrivateChat.find({
      _id: privateChatId,
    })
      .select('messages.text messages.sender messages.timestamp messages.status')
      .populate({ path: 'messages.sender', select: 'email' })
      .populate({
        path: 'media',
        populate: { path: 'sender', select: 'email' },
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
          message: `Private messages thread with ID ${privateChatId} not found.`,
        })
      : res.status(200).json({
          combinedMessages,
          message: `Successfully retrieved all messages for user with ID ${userId} in message thread ${privateChatId}.`,
        });
  } catch (error) {
    console.error(error.message);
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
