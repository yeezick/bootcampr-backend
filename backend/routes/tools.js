import { Router } from 'express';
import * as controllers from "../controllers/tools.js";

const router = Router();

router.get('/tools', controllers.getAllTools);
router.post('/tools', controllers.createTool);
router.put('/tools/:id', controllers.updateTool);
router.delete('/tools/:id', controllers.deleteTool);

export default router;