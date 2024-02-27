import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getAllComments,
  getReplies,
  getTicketComments,
  updateComment,
} from '../../controllers/project/comments.js';

const router = Router();

router.get('/comments', getAllComments);
router.get('/comments/:ticketId', getTicketComments);
router.get('/comments/:commentId/replies', getReplies);
router.post('/comments/create', createComment);
router.patch('/comments/update/:commentId', updateComment);
router.delete('/comments/:id', deleteComment);

export default router;
