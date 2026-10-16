import Workflow from '../models/Workflow.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listWorkflows = asyncHandler(async (req, res) => {
  const filter = req.query.repository ? { repository: req.query.repository } : {};
  const workflows = await Workflow.find(filter).populate('repository', 'fullName htmlUrl').sort({ name: 1 }).lean();
  sendSuccess(res, workflows);
});

export const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findById(req.params.id).populate('repository', 'fullName htmlUrl').lean();
  if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
  sendSuccess(res, workflow);
});
