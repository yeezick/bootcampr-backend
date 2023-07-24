import { Router } from 'express';
import { createTicket, updateTicketInformationAndStatus, deleteTicket } from '../controllers/tickets.js';
import { createComment, deleteComment, getAllComments, getTicketComments, updateComment } from '../controllers/task-management/comments.js';

const router = Router();

// roles
router.post('/createTicket', createTicket);
router.put('/updateTicketInformation', updateTicketInformationAndStatus);
router.post('/deleteTicket', deleteTicket);

// comments
router.post('/createComment', createComment);
router.get('/comments', getAllComments)
router.get('/ticket/:ticketId/comments', getTicketComments)
router.delete('/comments/:id', deleteComment)
router.post('/updateComment/:commentId', updateComment)

export default router;
