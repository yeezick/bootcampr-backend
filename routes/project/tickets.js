import { Router } from 'express';
import { createTicket, updateTicket, deleteTicket } from '../../controllers/project/tickets.js';

const router = Router();

router.post('/tickets/create', createTicket);
router.put('/tickets/:ticketId', updateTicket);
router.put('/tickets/delete/:ticketId', deleteTicket);

export default router;
