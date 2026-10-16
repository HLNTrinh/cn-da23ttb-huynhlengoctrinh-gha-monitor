import { Router } from 'express';
import { listCommits } from '../controllers/commitController.js';

const router = Router();
router.get('/', listCommits);
export default router;
