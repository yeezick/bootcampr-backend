import { Router } from 'express';
import multer from 'multer';
import { addImagesToS3Bucket, deleteImageFromS3Bucket } from '../../controllers/user/addingImage.js';
import {
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getOneUser,
  updateUserInfo,
  getOneUserByEmail,
  updateUserExperience,
} from '../../controllers/user/users.js';
import { getEmailPreferences, updateEmailPreferences } from '../../controllers/user/communications.js';
import { generateTeam } from '../../controllers/team-matching.js';

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
router.post('/users/experience/:userId', updateUserExperience);
router.delete('/users/:id', deleteUser);

// Profile Image
router.post('/users/:id/addImage', uploadImage.single('image'), addImagesToS3Bucket);
router.delete('/users/:id/deleteImage', deleteImageFromS3Bucket);

// Email Preferences
router.get('/users/:userId/emailPreferences', getEmailPreferences);
router.post('/users/:userId/updateEmailPreferences', updateEmailPreferences);

// Generate Team
router.post('/generate-team', generateTeam);

export default router;
