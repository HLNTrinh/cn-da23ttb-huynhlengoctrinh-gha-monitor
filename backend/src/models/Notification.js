import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  dedupeKey: { type: String, required: true, unique: true },
  rule: { type: mongoose.Schema.Types.ObjectId, ref: 'AlertRule', required: true },
  run: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRun', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  message: { type: String, required: true },
  conclusion: { type: String, default: '' },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
