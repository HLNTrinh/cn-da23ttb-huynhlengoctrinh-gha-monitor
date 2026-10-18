import Commit from '../models/Commit.js';
import Repository from '../models/Repository.js';
import { syncCommitHistory } from '../services/githubService.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listCommits = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? '25', 10) || 25));
  const filter = {};
  if (req.query.repository) {
    const repository = await Repository.findOne({ fullName: req.query.repository }).select('_id').lean();
    if (!repository) {
      return sendSuccess(res, { items: [], page, limit, total: 0, pages: 0 });
    }
    filter.repository = repository._id;
  }
  const [commits, total] = await Promise.all([
    Commit.find(filter)
      .populate('repository', 'fullName')
      .populate({
        path: 'workflowRun',
        select: 'htmlUrl runNumber status conclusion createdAt workflow',
        populate: { path: 'workflow', select: 'name' }
      })
      .sort({ committedAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Commit.countDocuments(filter)
  ]);
  const items = commits.map((commit) => ({
    _id: commit._id,
    sha: commit.sha,
    repository: commit.repository,
    branch: commit.branch,
    actor: commit.author,
    createdAt: commit.committedAt,
    htmlUrl: commit.htmlUrl,
    workflow: commit.workflowRun?.workflow,
    runNumber: commit.workflowRun?.runNumber,
    runHtmlUrl: commit.workflowRun?.htmlUrl,
    status: commit.workflowRun?.status,
    conclusion: commit.workflowRun?.conclusion
  }));
  sendSuccess(res, { items, page, limit, total, pages: Math.ceil(total / limit) });
});

export const refreshCommitHistory = asyncHandler(async (req, res) => {
  const { repository } = req.body;
  if (typeof repository !== 'string' || !repository.trim()) {
    return res.status(400).json({ success: false, message: 'Repository is required' });
  }
  sendSuccess(res, await syncCommitHistory(repository.trim()));
});
