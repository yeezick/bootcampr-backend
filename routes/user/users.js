import { Router } from 'express';
import multer from 'multer';
import { getMediaByUserId } from '../../controllers/chat/media.js';
import { addImagesToS3Bucket, deleteImageFromS3Bucket } from '../../controllers/user/addingImage.js';
import {
  updateUserProfile,
  deleteUser,
  getAllChatThreads,
  getAllUsers,
  getOneUser,
  markConversationAsRead,
  setUnreadMessageForUser,
  updateUserInfo,
  getOneUserByEmail,
} from '../../controllers/user/users.js';
import { getEmailPreferences, updateEmailPreferences } from '../../controllers/user/communications.js';

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getOneUser);
router.get('/users/email/:email', getOneUserByEmail);
router.post('/users/:id', updateUserInfo);
router.post('/onboarding/:id', updateUserProfile);
router.delete('/users/:id', deleteUser);

// Profile Image
router.post('/users/:id/addImage', uploadImage.single('image'), addImagesToS3Bucket);
router.delete('/users/:id/deleteImage', deleteImageFromS3Bucket);

// Chat Threads
router.get('/users/:userId/messages', getAllChatThreads);
router.get('/users/:userId/media', getMediaByUserId);
router.post('/messages/setUnreadMessages', setUnreadMessageForUser);
router.post('/users/:userId/messages/markConversationAsRead', markConversationAsRead);

// Email Preferences
router.get('/users/:userId/emailPreferences', getEmailPreferences)
router.post('/users/:userId/updateEmailPreferences', updateEmailPreferences)

export default router;
