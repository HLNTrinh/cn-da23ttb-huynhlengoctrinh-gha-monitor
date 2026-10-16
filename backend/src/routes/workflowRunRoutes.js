import { Router } from 'express';
import { getRun, listRuns } from '../controllers/workflowRunController.js';

const router = Router();
router.get('/', listRuns);
router.get('/:id', getRun);
export default router;
