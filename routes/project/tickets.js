import { Router } from 'express';
import { createTicket, updateTicketInformationAndStatus, deleteTicket } from '../../controllers/tickets.js';
import {
  createComment,
  deleteComment,
  getAllComments,
  getReplies,
  getTicketComments,
  updateComment,
} from '../../controllers/task-management/comments.js';

const router = Router();

// roles
router.post('/tickets/create', createTicket);
router.put('/tickets/:ticketId', updateTicketInformationAndStatus);
router.post('/tickets/:ticketId', deleteTicket);

// comments
router.get('/comments', getAllComments);
router.get('/ticket/:ticketId/comments', getTicketComments);
router.get('/comment/:commentId/replies', getReplies);
router.post('/createComment', createComment);
router.patch('/updateComment/:commentId', updateComment);
router.delete('/comments/:id', deleteComment);

export default router;
