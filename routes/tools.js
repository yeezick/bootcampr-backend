import { Router } from 'express';
import { createTool, deleteTool, getAllTools, updateTool } from '../controllers/tools.js';

const router = Router();

router.get('/tools', getAllTools);
router.post('/tools', createTool);
router.put('/tools/:id', updateTool);
router.delete('/tools/:id', deleteTool);

export default router;
