import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  status: { type: String, default: 'queued' },
  conclusion: { type: String, default: null },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

stepSchema.index({ job: 1, number: 1 }, { unique: true });
export default mongoose.model('Step', stepSchema);
