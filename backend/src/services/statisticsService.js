import WorkflowRun from '../models/WorkflowRun.js';

export async function getStatistics() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totals, daily] = await Promise.all([
    WorkflowRun.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ['$conclusion', 'success'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$conclusion', 'failure'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] } },
        averageDurationMs: { $avg: { $cond: [
          { $and: [{ $ne: ['$startedAt', null] }, { $ne: ['$completedAt', null] }] },
          { $subtract: ['$completedAt', '$startedAt'] },
          null
        ] } }
      } }
    ]),
    WorkflowRun.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);
  const summary = totals[0] ?? { total: 0, successful: 0, failed: 0, inProgress: 0, averageDurationMs: null };
  return {
    ...summary,
    successRate: summary.total ? Math.round((summary.successful / summary.total) * 1000) / 10 : 0,
    daily
  };
}
