import { Router } from 'express';
import { createTicket, updateTicket, deleteTicket } from '../../controllers/tickets.js';
import {
  createComment,
  deleteComment,
  getAllComments,
  getReplies,
  getTicketComments,
  updateComment,
} from '../../controllers/task-management/comments.js';

const router = Router();

// tickets
router.post('/tickets/create', createTicket);
router.put('/tickets/:ticketId', updateTicket);
router.put('/tickets/delete/:ticketId', deleteTicket);

// comments
router.get('/comments', getAllComments);
router.get('/ticket/:ticketId/comments', getTicketComments);
router.get('/comment/:commentId/replies', getReplies);
router.post('/createComment', createComment);
router.patch('/updateComment/:commentId', updateComment);
router.delete('/comments/:id', deleteComment);

export default router;
