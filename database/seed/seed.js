import 'dotenv/config';
import mongoose from 'mongoose';
import '../../backend/src/models/Repository.js';
import '../../backend/src/models/Workflow.js';
import '../../backend/src/models/WorkflowRun.js';
import '../../backend/src/models/Job.js';
import '../../backend/src/models/Step.js';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');
await mongoose.connect(uri);
console.log('Database models initialized. Use the GitHub sync endpoint to load real repository data.');
await mongoose.disconnect();
