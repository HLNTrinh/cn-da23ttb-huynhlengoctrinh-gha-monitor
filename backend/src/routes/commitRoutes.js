import { Router } from 'express';
import { listCommits, refreshCommitHistory } from '../controllers/commitController.js';

const router = Router();
router.post('/sync', refreshCommitHistory);
router.get('/', listCommits);
export default router;
