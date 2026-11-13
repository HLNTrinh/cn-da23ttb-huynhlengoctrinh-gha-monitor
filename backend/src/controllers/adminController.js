import AdminUser from '../models/AdminUser.js';
import AdminAccount from '../models/AdminAccount.js';
import AlertRule from '../models/AlertRule.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import Repository from '../models/Repository.js';
import { isEnvironmentAdmin, recordAudit } from '../services/adminService.js';
import { hashAdminPassword } from '../services/adminAuthService.js';
import { syncAll } from '../services/githubService.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const getAdminOverview = asyncHandler(async (req, res) => {
  const [users, repositories, alerts, unreadAlerts, recentActivity] = await Promise.all([
    AdminUser.countDocuments({ active: true }),
    Repository.countDocuments({
      enabled: true,
      $or: [{ monitoringEnabled: true }, { monitoringEnabled: { $exists: false } }]
    }),
    AlertRule.countDocuments({ enabled: true }),
    Notification.countDocuments({ readAt: null }),
    AuditLog.find().sort({ createdAt: -1 }).limit(8).lean()
  ]);
  sendSuccess(res, { users, repositories, alerts, unreadAlerts, recentActivity });
});

export const syncAllRepositories = asyncHandler(async (req, res) => {
  const result = await syncAll();
  await recordAudit(req, 'repository.sync.all', '', { count: result.length });
  sendSuccess(res, result);
});

export const listManagedRepositories = asyncHandler(async (req, res) => {
  const repositories = await Repository.find().sort({ fullName: 1 }).lean();
  sendSuccess(res, repositories);
});

export const updateManagedRepository = asyncHandler(async (req, res) => {
  if (typeof req.body.monitoringEnabled !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Monitoring enabled must be a boolean' });
  }
  const repository = await Repository.findByIdAndUpdate(
    req.params.id,
    { $set: { monitoringEnabled: req.body.monitoringEnabled } },
    { new: true, runValidators: true }
  );
  if (!repository) return res.status(404).json({ success: false, message: 'Repository not found' });
  await recordAudit(req, 'admin.repository.updated', repository.fullName, { monitoringEnabled: repository.monitoringEnabled });
  sendSuccess(res, repository);
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const users = await AdminUser.find().sort({ githubLogin: 1 }).lean();
  sendSuccess(res, users);
});

export const listAdminAccounts = asyncHandler(async (req, res) => {
  const accounts = await AdminAccount.find()
    .select('email active lastLoginAt createdAt')
    .sort({ email: 1 })
    .lean();
  sendSuccess(res, accounts);
});

export const createAdminAccount = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 14 || password.length > 256) {
    return res.status(400).json({
      success: false,
      message: 'Provide a valid email and a password of 14-256 characters'
    });
  }

  try {
    const account = await AdminAccount.create({
      email,
      passwordHash: await hashAdminPassword(password)
    });
    await recordAudit(req, 'admin.account.created', email);
    return sendSuccess(res, { _id: account._id, email: account.email, active: account.active }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An admin account with this email already exists' });
    }
    throw error;
  }
});

export const updateAdminAccount = asyncHandler(async (req, res) => {
  if (typeof req.body.active !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Active must be a boolean' });
  }
  const account = await AdminAccount.findById(req.params.id).select('email active sessionVersion');
  if (!account) return res.status(404).json({ success: false, message: 'Admin account not found' });
  if (account.email === req.user.email && req.body.active === false) {
    return res.status(400).json({ success: false, message: 'You cannot disable your own admin account' });
  }
  if (account.active && !req.body.active && await AdminAccount.countDocuments({ active: true }) <= 1) {
    return res.status(400).json({ success: false, message: 'At least one active admin account is required' });
  }

  account.active = req.body.active;
  account.sessionVersion += 1;
  await account.save();
  await recordAudit(req, 'admin.account.updated', account.email, { active: account.active });
  sendSuccess(res, { _id: account._id, email: account.email, active: account.active });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const githubLogin = typeof req.body.githubLogin === 'string' ? req.body.githubLogin.trim().replace(/^@/, '').toLowerCase() : '';
  const role = req.body.role === 'admin' ? 'admin' : req.body.role === 'viewer' ? 'viewer' : '';
  if (!/^[a-z\d-]{1,39}$/.test(githubLogin) || !role) {
    return res.status(400).json({ success: false, message: 'Provide a valid GitHub username and role' });
  }
  let user;
  try {
    user = await AdminUser.create({ githubLogin, role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This GitHub account is already registered' });
    }
    throw error;
  }
  await recordAudit(req, 'admin.user.created', githubLogin, { role });
  sendSuccess(res, user, 201);
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await AdminUser.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const role = req.body.role;
  const active = req.body.active;
  if (role !== undefined && !['admin', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role must be admin or viewer' });
  }
  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Active must be a boolean' });
  }
  if (req.user.login.toLowerCase() === user.githubLogin && (role === 'viewer' || active === false)) {
    return res.status(400).json({ success: false, message: 'You cannot remove your own administrator access' });
  }
  if ((role === 'viewer' || active === false) && isEnvironmentAdmin(user.githubLogin)) {
    return res.status(400).json({ success: false, message: 'Environment-allowlisted users keep administrator access' });
  }

  if (role !== undefined) user.role = role;
  if (active !== undefined) user.active = active;
  await user.save();
  await recordAudit(req, 'admin.user.updated', user.githubLogin, {
    ...(role !== undefined ? { role } : {}),
    ...(active !== undefined ? { active } : {})
  });
  sendSuccess(res, user);
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await AdminUser.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.user.login.toLowerCase() === user.githubLogin) {
    return res.status(400).json({ success: false, message: 'You cannot remove your own account' });
  }
  if (isEnvironmentAdmin(user.githubLogin)) {
    return res.status(400).json({ success: false, message: 'Environment-allowlisted users cannot be removed here' });
  }
  await user.deleteOne();
  await recordAudit(req, 'admin.user.deleted', user.githubLogin);
  sendSuccess(res, { deleted: true });
});

export const listAlertRules = asyncHandler(async (req, res) => {
  const [rules, repositories] = await Promise.all([
    AlertRule.find().populate('repository', 'fullName').sort({ createdAt: -1 }).lean(),
    Repository.find({
      enabled: true,
      $or: [{ monitoringEnabled: true }, { monitoringEnabled: { $exists: false } }]
    }).select('fullName').sort({ fullName: 1 }).lean()
  ]);
  sendSuccess(res, { rules, repositories });
});

export const createAlertRule = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const triggerOn = req.body.triggerOn ?? 'failure';
  const branch = typeof req.body.branch === 'string' ? req.body.branch.trim() : '';
  if (!name || name.length > 100 || !['failure', 'success', 'any'].includes(triggerOn)) {
    return res.status(400).json({ success: false, message: 'Provide a rule name and valid trigger condition' });
  }
  if (branch.length > 200) {
    return res.status(400).json({ success: false, message: 'Branch must not exceed 200 characters' });
  }
  const repository = req.body.repository || null;
  if (repository && !await Repository.exists({
    _id: repository,
    enabled: true,
    $or: [{ monitoringEnabled: true }, { monitoringEnabled: { $exists: false } }]
  })) {
    return res.status(400).json({ success: false, message: 'Repository not found or disabled' });
  }
  const rule = await AlertRule.create({
    name,
    triggerOn,
    repository,
    branch
  });
  await recordAudit(req, 'admin.alert.created', name, { triggerOn, repository, branch: rule.branch });
  sendSuccess(res, rule, 201);
});

export const updateAlertRule = asyncHandler(async (req, res) => {
  const rule = await AlertRule.findById(req.params.id);
  if (!rule) return res.status(404).json({ success: false, message: 'Alert rule not found' });

  const { name, enabled, triggerOn, branch } = req.body;
  if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 100)) {
    return res.status(400).json({ success: false, message: 'Rule name must contain 1 to 100 characters' });
  }
  if (enabled !== undefined && typeof enabled !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Enabled must be a boolean' });
  }
  if (triggerOn !== undefined && !['failure', 'success', 'any'].includes(triggerOn)) {
    return res.status(400).json({ success: false, message: 'Invalid alert condition' });
  }
  if (branch !== undefined && (typeof branch !== 'string' || branch.trim().length > 200)) {
    return res.status(400).json({ success: false, message: 'Branch must be a string of at most 200 characters' });
  }
  if (req.body.repository !== undefined && req.body.repository &&
    !await Repository.exists({
      _id: req.body.repository,
      enabled: true,
      $or: [{ monitoringEnabled: true }, { monitoringEnabled: { $exists: false } }]
    })) {
    return res.status(400).json({ success: false, message: 'Repository not found or disabled' });
  }

  if (name !== undefined) rule.name = name.trim();
  if (enabled !== undefined) rule.enabled = enabled;
  if (triggerOn !== undefined) rule.triggerOn = triggerOn;
  if (branch !== undefined) rule.branch = branch.trim();
  if (req.body.repository !== undefined) rule.repository = req.body.repository || null;
  await rule.save();
  await recordAudit(req, 'admin.alert.updated', rule.name);
  sendSuccess(res, rule);
});

export const deleteAlertRule = asyncHandler(async (req, res) => {
  const rule = await AlertRule.findById(req.params.id);
  if (!rule) return res.status(404).json({ success: false, message: 'Alert rule not found' });
  await rule.deleteOne();
  await recordAudit(req, 'admin.alert.deleted', rule.name);
  sendSuccess(res, { deleted: true });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? '25', 10) || 25));
  const [items, total, unread] = await Promise.all([
    Notification.find().populate('rule', 'name').populate('repository', 'fullName')
      .populate('run', 'name runNumber htmlUrl branch conclusion').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(),
    Notification.countDocuments({ readAt: null })
  ]);
  sendSuccess(res, { items, total, unread, page, pages: Math.ceil(total / limit) });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  await recordAudit(req, 'admin.notification.read', notification._id.toString());
  sendSuccess(res, notification);
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? '50', 10) || 50));
  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AuditLog.countDocuments()
  ]);
  sendSuccess(res, { items, total, page, pages: Math.ceil(total / limit) });
});
