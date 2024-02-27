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
      res.status(404).json({ message: 'User not found.', error: `No user found with id ${id}.` });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Error occurred while fetching user', error: error.message });
  }
};

export const getOneUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email }).select('id');
    if (user) {
      return res.status(200).json({ id: user._id });
    } else {
      return res.status(404).json({ message: 'User not found.', error: `No user found with email ${email}.` });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Error occurred while fetching user', error: error.message });
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
      { role, availability, firstName, lastName, bio, links },
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
    const {
      role,
      availability,
      firstName,
      lastName,
      bio,
      links,
      onboarded,
      profilePicture,
      defaultProfilePicture,
      hasProfilePicture,
    } = req.body;
    const imageUrl = `https://bootcampruserimage.s3.amazonaws.com/${id}`;
    const user = await User.findByIdAndUpdate(
      id,
      {
        role,
        availability,
        firstName,
        lastName,
        bio,
        links,
        onboarded,
        profilePicture: hasProfilePicture ? imageUrl : '',
        defaultProfilePicture,
        hasProfilePicture
      },
      { new: true },
    );
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ error: 'User not found.' });
    }

    await updatingImage(id);

    res.status(200).send(user);
  } catch (error) {
    console.log('Error message: ', error.message);
    res.status(404).json({ error: error.message });
  }
};
