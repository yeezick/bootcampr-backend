import { Router } from 'express';
import { verifyEmailLink, resendNewEmailLink } from '../controllers/emailVerification.js';
import * as controllers from '../controllers/users.js';
import multer from 'multer';
import { addImagesToS3Bucket } from '../controllers/addingImage.js';
// import restrict from '../helpers/restrict.js'

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

// standard crud
router.get('/users', controllers.getAllUsers);
router.get('/users/:id', controllers.getOneUser);
router.post('/sign-up', controllers.signUp);
router.put('/users/:id', controllers.updateUserInfo);
router.patch('/users/:id', controllers.addPortfolioProject);
router.delete('/users/:id', controllers.deleteUser);
router.post('/addUserImage', uploadImage.single('image'), addImagesToS3Bucket);

// auth
router.post('/sign-in', controllers.signIn);
router.get('/verify', controllers.verify);
router.post('/users/:id/expired-link', resendNewEmailLink);
router.get('/:id/verify/:token', verifyEmailLink);
router.post('/confirm-password/:userID', controllers.confirmPassword);
router.patch('/update-password/:userID', controllers.updatePassword);

export default router;
