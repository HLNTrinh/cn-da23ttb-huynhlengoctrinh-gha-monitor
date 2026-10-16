import WorkflowRun from '../models/WorkflowRun.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listCommits = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? '25', 10) || 25));

  const [result] = await WorkflowRun.aggregate([
    { $match: { commitSha: { $exists: true, $ne: '' } } },
    { $sort: { createdAt: -1, _id: 1 } },
    {
      $group: {
        _id: { repository: '$repository', commitSha: '$commitSha' },
        run: { $first: '$$ROOT' }
      }
    },
    { $sort: { 'run.createdAt': -1, '_id.commitSha': 1 } },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'repositories',
              localField: 'run.repository',
              foreignField: '_id',
              as: 'repository'
            }
          },
          { $unwind: '$repository' },
          {
            $lookup: {
              from: 'workflows',
              localField: 'run.workflow',
              foreignField: '_id',
              as: 'workflow'
            }
          },
          { $unwind: { path: '$workflow', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: '$run._id',
              sha: '$_id.commitSha',
              repository: { _id: '$repository._id', fullName: '$repository.fullName' },
              branch: '$run.branch',
              actor: '$run.actor',
              createdAt: '$run.createdAt',
              htmlUrl: '$run.htmlUrl',
              workflow: { name: '$workflow.name' },
              runNumber: '$run.runNumber',
              status: '$run.status',
              conclusion: '$run.conclusion'
            }
          }
        ],
        total: [{ $count: 'count' }]
      }
    }
  ]);

  const total = result?.total[0]?.count ?? 0;
  sendSuccess(res, { items: result?.items ?? [], page, limit, total, pages: Math.ceil(total / limit) });
});
