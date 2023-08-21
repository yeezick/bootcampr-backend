import { Router } from 'express';
import { resendNewEmailLink, verifyEmailLink, verifyUniqueEmail } from '../../controllers/auth/emailVerification.js';
import { signUp, signIn, verify, confirmPassword, updatePassword, updateEmail } from '../../controllers/auth/auth.js';

//middleware
const router = Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/verify', verify);
router.get('/verify-email/:email', verifyUniqueEmail);
router.post('/users/:id/expired-link', resendNewEmailLink);
router.post('/users/:id/update-email-verification', updateEmail)
router.get('/:id/verify/:token', verifyEmailLink);
router.post('/confirm-password/:userID', confirmPassword);
router.patch('/update-password/:userID', updatePassword);

export default router;
