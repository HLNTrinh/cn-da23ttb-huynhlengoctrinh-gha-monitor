import WorkflowRun from '../models/WorkflowRun.js';
import { getRunDetails } from '../services/workflowService.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listRuns = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? '25', 10) || 25));
  const filter = {};
  if (req.query.repository) filter.repository = req.query.repository;
  if (req.query.workflow) filter.workflow = req.query.workflow;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.conclusion) filter.conclusion = req.query.conclusion;
  const [runs, total] = await Promise.all([
    WorkflowRun.find(filter).populate('repository', 'fullName').populate('workflow', 'name')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    WorkflowRun.countDocuments(filter)
  ]);
  sendSuccess(res, { items: runs, page, limit, total, pages: Math.ceil(total / limit) });
});

export const getRun = asyncHandler(async (req, res) => {
  const run = await getRunDetails(req.params.id);
  if (!run) return res.status(404).json({ success: false, message: 'Workflow run not found' });
  sendSuccess(res, run);
});
