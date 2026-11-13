import { Router } from 'express';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import {
  createAdminUser,
  createAdminAccount,
  createAlertRule,
  deleteAdminUser,
  deleteAlertRule,
  getAdminOverview,
  listAdminUsers,
  listAdminAccounts,
  listAlertRules,
  listAuditLogs,
  listManagedRepositories,
  listNotifications,
  syncAllRepositories,
  markNotificationRead,
  updateAdminUser,
  updateAdminAccount,
  updateManagedRepository,
  updateAlertRule
} from '../controllers/adminController.js';

const router = Router();
router.use(adminMiddleware);
router.get('/overview', getAdminOverview);
router.post('/sync-all', syncAllRepositories);
router.get('/repositories', listManagedRepositories);
router.patch('/repositories/:id', updateManagedRepository);
router.get('/users', listAdminUsers);
router.get('/accounts', listAdminAccounts);
router.post('/accounts', createAdminAccount);
router.patch('/accounts/:id', updateAdminAccount);
router.post('/users', createAdminUser);
router.patch('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.get('/alerts/rules', listAlertRules);
router.post('/alerts/rules', createAlertRule);
router.patch('/alerts/rules/:id', updateAlertRule);
router.delete('/alerts/rules/:id', deleteAlertRule);
router.get('/alerts/history', listNotifications);
router.post('/alerts/history/:id/read', markNotificationRead);
router.get('/activity', listAuditLogs);
export default router;
