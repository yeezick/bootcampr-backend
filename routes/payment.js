import { Router } from 'express';
import { createCheckout } from '../controllers/payment/payment.js';

const router = Router();

router.post('/payment/checkout', createCheckout);

export default router;
