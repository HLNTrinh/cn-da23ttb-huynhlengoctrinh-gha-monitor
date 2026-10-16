import WorkflowRun from '../models/WorkflowRun.js';
import Job from '../models/Job.js';
import Step from '../models/Step.js';

export async function getRunDetails(id) {
  const run = await WorkflowRun.findById(id)
    .populate('repository')
    .populate('workflow')
    .lean();
  if (!run) return null;
  const jobs = await Job.find({ run: run._id }).sort({ startedAt: 1 }).lean();
  const jobIds = jobs.map((job) => job._id);
  const steps = await Step.find({ job: { $in: jobIds } }).sort({ number: 1 }).lean();
  const stepsByJob = new Map();
  for (const step of steps) {
    const key = step.job.toString();
    stepsByJob.set(key, [...(stepsByJob.get(key) ?? []), step]);
  }
  return { ...run, jobs: jobs.map((job) => ({ ...job, steps: stepsByJob.get(job._id.toString()) ?? [] })) };
}
