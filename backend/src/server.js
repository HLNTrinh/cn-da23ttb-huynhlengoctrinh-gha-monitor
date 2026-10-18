import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { syncAll } from './services/githubService.js';
import logger from './utils/logger.js';

const port = Number(process.env.PORT ?? 4000);
await connectDatabase();
const server = app.listen(port, () => logger.info(`API listening on port ${port}`));

if (process.env.SYNC_ON_START === 'true') {
  syncAll().catch((error) => logger.error('Initial GitHub sync failed', error));
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
