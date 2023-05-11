import { Router } from 'express';
import { deleteMediaById, getAllMedia } from '../../controllers/chat/media.js';
const router = Router();

router.get('/media', getAllMedia);
router.delete('/media/:mediaId', deleteMediaById);

export default router;
