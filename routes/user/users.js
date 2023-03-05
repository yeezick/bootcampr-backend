import { Router } from 'express';
import multer from 'multer';
import { addImagesToS3Bucket } from '../controllers/addingImage.js';
import {
  addPortfolioProject,
  deleteUser,
  getAllUsers,
  getOneUser,
  updateUserInfo,
} from '../controllers/users.js';

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getOneUser);
router.put('/users/:id', updateUserInfo);
router.patch('/users/:id', addPortfolioProject);
router.delete('/users/:id', deleteUser);
router.post('/addUserImage', uploadImage.single('image'), addImagesToS3Bucket);

export default router;
