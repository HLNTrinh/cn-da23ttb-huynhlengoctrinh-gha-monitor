import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true, index: true },
  owner: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  fullName: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  htmlUrl: { type: String, required: true },
  defaultBranch: { type: String, default: 'main' },
  isPrivate: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  lastSyncedAt: Date
}, { timestamps: true });

export default mongoose.model('Repository', repositorySchema);
