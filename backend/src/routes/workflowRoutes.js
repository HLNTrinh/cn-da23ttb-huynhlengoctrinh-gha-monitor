import { Router } from 'express';
import { getWorkflow, listWorkflows } from '../controllers/workflowController.js';

const router = Router();
router.get('/', listWorkflows);
router.get('/:id', getWorkflow);
export default router;
