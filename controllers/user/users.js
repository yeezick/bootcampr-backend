import User from '../../models/user.js';
import { updatingImage } from './addingImage.js';

export const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find({}).populate(['memberOfProjects']);
    if (allUser) {
      res.status(200).json(allUser);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ message: 'All User not found.', error: error.message });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user) {
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error.message);
    return res.status(404).json({ message: 'User not found.', error: error.message });
  }
};

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

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    const updatedUserImg = await updatingImage(id);
    res.status(200).send(updatedUserImg);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ error: error.message });
  }
};
