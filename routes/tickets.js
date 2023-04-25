import { Router } from 'express';
import { createTicket, ticketStatusChanged, ticketStatusHasNotChanged } from '../controllers/tickets.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);
router.put('/ticketStatusChanged', ticketStatusChanged);
router.put('/ticketStatusHasNotChanged', ticketStatusHasNotChanged);

export default router;
