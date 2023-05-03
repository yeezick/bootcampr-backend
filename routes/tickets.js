import { Router } from 'express';
import {
  createTicket,
  ticketStatusChanged,
  updateTicketInformationAndStatus,
  ticketDraggedToNewSection,
  deleteTicket,
} from '../controllers/tickets.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);
router.put('/ticketStatusChanged', ticketStatusChanged);
router.put('/ticketStatusHasNotChanged', updateTicketInformationAndStatus);
router.put('/ticketDraggedToNewSection', ticketDraggedToNewSection);
router.post('/deleteTicket', deleteTicket);

export default router;
