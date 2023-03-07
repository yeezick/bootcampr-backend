import { Router } from 'express';
import { resendNewEmailLink, verifyEmailLink } from '../controllers/emailVerification.js';
import {
  confirmPassword,
  signIn,
  signUp,
  updatePassword,
  verify,
} from '../controllers/users.js';

//middleware
const router = Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/verify', verify);
router.post('/users/:id/expired-link', resendNewEmailLink);
router.get('/:id/verify/:token', verifyEmailLink);
router.post('/confirm-password/:userID', confirmPassword);
router.patch('/update-password/:userID', updatePassword);

export default router;
