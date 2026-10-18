import { Router } from 'express';
import { getOverview } from '../controllers/statisticsController.js';

const router = Router();
router.get('/', getOverview);
export default router;
