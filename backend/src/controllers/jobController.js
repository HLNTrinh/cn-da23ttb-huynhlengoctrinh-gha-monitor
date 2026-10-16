import Job from '../models/Job.js';
import Step from '../models/Step.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ run: req.params.runId }).sort({ startedAt: 1 }).lean();
  sendSuccess(res, jobs);
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).lean();
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  job.steps = await Step.find({ job: job._id }).sort({ number: 1 }).lean();
  sendSuccess(res, job);
});
