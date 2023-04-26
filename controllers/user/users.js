import User from '../../models/user.js';
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
    return res.status(500).json({
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
