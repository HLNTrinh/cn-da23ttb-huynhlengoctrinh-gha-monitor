import Repository from '../models/Repository.js';
import Workflow from '../models/Workflow.js';
import WorkflowRun from '../models/WorkflowRun.js';
import { syncAll, syncRepository, syncRepositories } from '../services/githubService.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listRepositories = asyncHandler(async (req, res) => {
  const repositories = await Repository.find().sort({ fullName: 1 }).lean();
  sendSuccess(res, repositories);
});

export const getRepository = asyncHandler(async (req, res) => {
  const repository = await Repository.findOne({ fullName: req.params.fullName }).lean();
  if (!repository) return res.status(404).json({ success: false, message: 'Repository not found' });
  const [workflowCount, runCount] = await Promise.all([
    Workflow.countDocuments({ repository: repository._id }),
    WorkflowRun.countDocuments({ repository: repository._id })
  ]);
  sendSuccess(res, { ...repository, workflowCount, runCount });
});

export const refreshRepositories = asyncHandler(async (req, res) => {
  const repositories = await syncRepositories();
  sendSuccess(res, repositories, 200);
});

export const refreshRepository = asyncHandler(async (req, res) => {
  sendSuccess(res, await syncRepository(req.params.fullName));
});

export const refreshAll = asyncHandler(async (req, res) => {
  sendSuccess(res, await syncAll());
});
