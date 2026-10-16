import { Router } from 'express';
import { getRepository, listRepositories, refreshAll, refreshRepositories, refreshRepository } from '../controllers/repositoryController.js';

const router = Router();
router.get('/', listRepositories);
router.post('/sync', refreshRepositories);
router.post('/sync-all', refreshAll);
router.get('/:owner/:name', (req, res, next) => {
  req.params.fullName = `${req.params.owner}/${req.params.name}`;
  return getRepository(req, res, next);
});
router.post('/:owner/:name/sync', (req, res, next) => {
  req.params.fullName = `${req.params.owner}/${req.params.name}`;
  return refreshRepository(req, res, next);
});
export default router;
