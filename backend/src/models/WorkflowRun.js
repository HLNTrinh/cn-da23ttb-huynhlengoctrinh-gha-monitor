import mongoose from 'mongoose';

const workflowRunSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true, index: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', index: true },
  name: { type: String, default: '' },
  event: { type: String, default: '' },
  status: { type: String, default: 'queued', index: true },
  conclusion: { type: String, default: null, index: true },
  branch: { type: String, default: '' },
  commitSha: { type: String, default: '' },
  actor: { type: String, default: '' },
  htmlUrl: { type: String, default: '' },
  runNumber: Number,
  runAttempt: Number,
  createdAt: Date,
  startedAt: Date,
  updatedAtGitHub: Date,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('WorkflowRun', workflowRunSchema);
