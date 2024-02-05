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
  matchCandidateToTeam,
} from '../../controllers/user/users.js';
import { getEmailPreferences, updateEmailPreferences } from '../../controllers/user/communications.js';

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

// Candidate Matching
router.get('/users/:userId/findTeam', matchCandidateToTeam)

export default router;