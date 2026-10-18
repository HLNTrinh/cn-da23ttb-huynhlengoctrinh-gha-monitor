import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true, index: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  name: { type: String, required: true },
  path: { type: String, default: '' },
  state: { type: String, default: 'active' },
  htmlUrl: { type: String, default: '' },
  badgeUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Workflow', workflowSchema);
