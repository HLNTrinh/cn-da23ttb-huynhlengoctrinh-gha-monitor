import mongoose from 'mongoose';

const commitSchema = new mongoose.Schema({
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  sha: { type: String, required: true },
  branch: { type: String, default: '' },
  message: { type: String, default: '' },
  author: { type: String, default: '' },
  committedAt: Date,
  htmlUrl: { type: String, default: '' },
  workflowRun: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRun', required: true }
}, { timestamps: true });

commitSchema.index({ repository: 1, sha: 1 }, { unique: true });
commitSchema.index({ committedAt: -1 });

export default mongoose.model('Commit', commitSchema);
