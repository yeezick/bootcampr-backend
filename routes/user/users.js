import { Router } from 'express';
import multer from 'multer';
<<<<<<< HEAD
import { addImagesToS3Bucket, deleteImageFromS3Bucket } from '../../controllers/user/addingImage.js';
import { deleteUser, getAllUsers, getOneUser, updateUserInfo } from '../../controllers/user/users.js';
=======
import { getMediaByUserId } from '../../controllers/chat/media.js';
import { addImagesToS3Bucket } from '../../controllers/user/addingImage.js';
import {
  deleteUser,
  getAllChatThreads,
  getAllUsers,
  getOneUser,
  updateUserInfo,
} from '../../controllers/user/users.js';
>>>>>>> 5cd2ff3 (integrate chat routes and controllers)

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

export default router;
