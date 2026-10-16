import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
  logger.info('Connected to MongoDB');
}
