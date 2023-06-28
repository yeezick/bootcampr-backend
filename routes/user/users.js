import { Router } from 'express';
import multer from 'multer';
import { getMediaByUserId } from '../../controllers/chat/media.js';
import { addImagesToS3Bucket, deleteImageFromS3Bucket } from '../../controllers/user/addingImage.js';
import { getProjectByUserId } from '../../controllers/project/projects.js';
import {
  deleteUser,
  getAllChatThreads,
  getAllUsers,
  getOneUser,
  updateUserInfo,
} from '../../controllers/user/users.js';

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getOneUser);
router.put('/users/:id', updateUserInfo);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/addImage', uploadImage.single('image'), addImagesToS3Bucket);
router.delete('/users/:id/deleteImage', deleteImageFromS3Bucket);

// Chat Threads
router.get('/users/:userId/messages', getAllChatThreads);
router.get('/users/:userId/media', getMediaByUserId);

// Projects
router.get('/users/:userId/project', getProjectByUserId);

export default router;
