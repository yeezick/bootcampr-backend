import { Router } from 'express';
import { createTicket, updateTicketInformationAndStatus, deleteTicket } from '../controllers/tickets.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);
router.put('/updateTicketInformation', updateTicketInformationAndStatus);
router.post('/deleteTicket', deleteTicket);

export default router;
