import { Router } from 'express';
import { getJob, listJobs } from '../controllers/jobController.js';

const router = Router();
router.get('/run/:runId', listJobs);
router.get('/:id', getJob);
export default router;
