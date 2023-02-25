import { Router } from 'express';
import multer from 'multer';
import { addImagesToS3Bucket } from '../controllers/addingImage.js';
import { resendNewEmailLink, verifyEmailLink } from '../controllers/emailVerification.js';
import {
  addPortfolioProject,
  confirmPassword,
  deleteUser,
  getAllUsers,
  getOneUser,
  signIn,
  signUp,
  updatePassword,
  updateUserInfo,
  verify,
} from '../controllers/users.js';
// import restrict from '../helpers/restrict.js'

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

// standard crud
router.get('/users', getAllUsers);
router.get('/users/:id', getOneUser);
router.post('/sign-up', signUp);
router.put('/users/:id', updateUserInfo);
router.patch('/users/:id', addPortfolioProject);
router.delete('/users/:id', deleteUser);
router.post('/addUserImage', uploadImage.single('image'), addImagesToS3Bucket);

// auth
router.post('/sign-in', signIn);
router.get('/verify', verify);
router.post('/users/:id/expired-link', resendNewEmailLink);
router.get('/:id/verify/:token', verifyEmailLink);
router.post('/confirm-password/:userID', confirmPassword);
router.patch('/update-password/:userID', updatePassword);

export default router;
