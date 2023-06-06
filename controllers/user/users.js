import mongoose from 'mongoose';
import User from '../../models/user.js';
import PrivateChat from '../../models/chat/privateChat.js';
import GroupChat from '../../models/chat/groupChat.js';
import { updatingImage } from './addingImage.js';

// ORIGINAL CODE

// export const getAllUsers = async (req, res) => {
//   try {
//     const allUser = await User.find({}).populate(['memberOfProjects']);
//     if (allUser) {
//       res.status(200).json(allUser);
//     }
//   } catch (error) {
//     console.log(error.message);
//     return res.status(404).json({ message: 'All User not found.', error: error.message });
//   }
// };

// BACKEND TEST SUITE CODE
export const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find().select('-passwordDigest');
    if (allUser && allUser.length > 0) {
      res.status(200).json(allUser);
    } else {
      res.status(404).json({ message: 'All User not found.', error: 'No users found in the database.' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error occurred while fetching users.',
      error: error.message,
    });
  }
};

// ORIGINAL CODE

// export const getOneUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findById(id);
//     if (user) {
//       return res.status(200).json(user);
//     }
//   } catch (error) {
//     console.error(error.message);
//     return res.status(404).json({ message: 'User not found.', error: error.message });
//   }
// };

// BACKEND TEST SUITE CODE
export const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordDigest');
    if (user) {
      return res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found.', error: 'No user found in the database.' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Error occured while fetching user', error: error.message });
  }
};

// NO UPDATES NEEDED FOR BACKEND TEST SUITE
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // deleteImageFromS3Bucket(id); // Koffi's fix
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      return res.status(200).send({ deletionStatus: true, message: 'User deleted.' });
    }
    throw new Error('User not found.');
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ deletionStatus: false, error: error.message });
  }
};

// ORIGINAL CODE

// export const updateUserInfo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findByIdAndUpdate(id, req.body, { new: true });
//     const updatedUserImg = await updatingImage(id);
//     res.status(200).send(updatedUserImg);
//   } catch (error) {
//     console.log(error.message);
//     return res.status(404).json({ error: error.message });
//   }
// };

// BACKEND TEST SUITE CODE
export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const updatedUserImg = await updatingImage(id);
    res.status(200).send(updatedUserImg);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ error: error.message });
  }
};

export const getAllChatThreads = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all private threads
    const privateThreads = await PrivateChat.find({
      participants: { $elemMatch: { $eq: mongoose.Types.ObjectId(userId) } },
    })
      .select('_id participants lastActive')
      .populate({
        path: 'participants',
        select: 'email firstName lastName profilePicture',
      })
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'email firstName lastName profilePicture',
        },
      })
      .populate({
        path: 'media',
        populate: {
          path: 'sender',
          select: 'email firstName lastName profilePicture',
        },
      });

    // Combine private chats text and media messages, and extract last message from each thread
    const privateThreadsLastMessage = privateThreads.map((thread) => {
      const messages = thread.messages?.concat(thread.media) || [];
      messages.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
      const lastMessage = messages[0];
      return {
        ...thread.toObject(),
        messages: undefined,
        media: undefined,
        lastMessage,
      };
    });

    // Fetch all group threads
    const groupThreads = await GroupChat.find({
      'participants.participant': mongoose.Types.ObjectId(userId),
    })
      .select('_id participants lastActive groupName groupPhoto')
      .populate({
        path: 'participants.participant',
        select: 'email firstName lastName profilePicture',
      })
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'email firstName lastName profilePicture',
        },
      })
      .populate({
        path: 'media',
        populate: {
          path: 'sender',
          select: 'email firstName lastName profilePicture',
        },
      });

    // Combine group chats text and media messages, and extract last message from each thread
    const groupThreadsLastMessage = groupThreads.map((thread) => {
      const messages = thread.messages?.concat(thread.media) || [];
      messages.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
      const lastMessage = messages[0];
      return {
        ...thread.toObject(),
        messages: undefined,
        media: undefined,
        lastMessage,
      };
    });

    // Combine private and group threads, and sort by lastActive
    const combinedThreads = privateThreadsLastMessage.concat(groupThreadsLastMessage);
    combinedThreads.sort((a, b) => {
      return new Date(b.lastActive) - new Date(a.lastActive);
    });

    combinedThreads.length === 0
      ? res.status(404).json({
          combinedThreads,
          message: `No conversation threads found for user with ID ${userId}.`,
        })
      : res.status(200).json({
          combinedThreads,
          message: `Successfully retrieved all chat threads for user with ID ${userId}.`,
        });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
