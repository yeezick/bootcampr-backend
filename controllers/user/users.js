import mongoose from 'mongoose';
import User from '../../models/user.js';
import PrivateChat from '../../models/chat/privateChat.js';
import GroupChat from '../../models/chat/groupChat.js';

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

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, availability, firstName, lastName, bio, links } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { role: role, availability: availability, firstName: firstName, lastName: lastName, bio: bio, links: links },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ error: 'User Profile not found.' });
    }
    user.save();
    res.status(201).json({
      message: 'User profile updated successfully.',
      userProfile: user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Failed to update user profile.' });
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
    console.log('Received request to update user with ID: ', id);
    console.log('Request body data: ', req.body);
    const {
      role,
      availability,
      firstName,
      lastName,
      bio,
      links,
      profilePicture,
      defaultProfilePicture,
      hasUploadedProfilePicture,
    } = req.body;
    console.log("Profile Picture====:", hasUploadedProfilePicture) 
    const imageUrl = `https://bootcampruserimage.s3.amazonaws.com/${id}`
    const user = await User.findByIdAndUpdate(
      id,
      {
        role: role,
        availability: availability,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        links: links,
        profilePicture: hasUploadedProfilePicture ? imageUrl : "",
        defaultProfilePicture: defaultProfilePicture,
        hasUploadedProfilePicture: hasUploadedProfilePicture,
      },
      { new: true },
    );

    console.log('Updated user object: ', user);
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ error: 'User not found.' });
    }
    // const updatedUserImg = await updatingImage(id);
    res.status(200).send(user);
  } catch (error) {
    console.log('Error message: ', error.message);
    res.status(404).json({ error: error.message });
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

export const setUnreadMessageForUser = async (req, res) => {
  try {
    const { chatId, usersArray } = req.body;

    const updatePromises = usersArray.map(async (userId) => {
      try {
        const user = await User.findOne({ _id: userId });

        if (user) {
          if (!user.unreadMessages.get(chatId)) {
            user.unreadMessages.set(chatId, true);
            await user.save();
          }
        } else {
          console.error(`User not found with id: ${userId}`);
        }
      } catch (error) {
        console.error(`Error updating user with id ${userId}: ${error.message}`);
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Unread messages updated for users successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.unreadMessages.has(chatId)) {
      user.unreadMessages.delete(chatId);
      await user.save();

      return res
        .status(200)
        .json({ unreadMessages: user.unreadMessages, message: 'Conversation marked as read successfully.' });
      // User with ID ${userId} successfully read the last message in group chat ${groupChatId}.
    } else {
      return res
        .status(200)
        .json({ unreadMessages: user.unreadMessages, message: 'Conversation is already marked as read.' });
      // Last message in group chat ${groupChatId} already read by user ${userId}.
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
