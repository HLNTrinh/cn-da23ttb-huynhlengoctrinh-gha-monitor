import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true, index: true },
  run: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRun', required: true, index: true },
  name: { type: String, required: true },
  status: { type: String, default: 'queued' },
  conclusion: { type: String, default: null },
  htmlUrl: { type: String, default: '' },
  startedAt: Date,
  completedAt: Date,
  runnerName: String,
  runnerGroupName: String
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
