import { Router } from 'express';
import { createTicket } from '../controllers/tickets.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);

export default router;
