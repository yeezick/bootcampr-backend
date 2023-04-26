import { Router } from 'express';
import {
  createTicket,
  ticketStatusChanged,
  ticketStatusHasNotChanged,
  ticketDraggedToNewSection,
} from '../controllers/tickets.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);
router.put('/ticketStatusChanged', ticketStatusChanged);
router.put('/ticketStatusHasNotChanged', ticketStatusHasNotChanged);
router.put('/ticketDraggedToNewSection', ticketDraggedToNewSection);

export default router;
