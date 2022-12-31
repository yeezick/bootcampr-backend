import { Router } from 'express';
import multer from 'multer';

import * as controllers from '../controllers/users.js';
import { addImagesToS3Bucket } from '../controllers/addingImage.js';
// import restrict from '../helpers/restrict.js'

//middleware
const storage = multer.memoryStorage();
const uploadImage = multer({ storage: storage });
const router = Router();

const nestedRouter = Router({ mergeParams: true });

// standard crud
router.get('/users', controllers.getAllUsers);
router.get('/users/:id', controllers.getOneUser);
router.put('/users/:id', controllers.updateUserInfo);
router.patch('/users/:id', controllers.addPortfolioProject);
router.delete('/users/:id', controllers.deleteUser);
router.get('/users/multiple', controllers.getMultipleUsers);
router.post('/addUserImage', uploadImage.single('image'), addImagesToS3Bucket); // "/users/uploadImage"

// auth
router.post('/sign-up', controllers.signUp);
router.post('/sign-in', controllers.signIn);
router.get('/verify', controllers.verify);
router.post('/email', controllers.checkEmail);
router.post('/confirm-password/:userID', controllers.confirmPassword);
router.patch('/update-password/:userID', controllers.updatePassword);

export default router;
