import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authMiddleware from './middlewares/authMiddleware.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware.js';
import { isValidSignature, processWebhook } from './services/webhookService.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import workflowRunRoutes from './routes/workflowRunRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',').map((url) => url.trim()) ?? 'http://localhost:5173' }));
app.use(morgan('combined'));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.post('/api/webhooks/github', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    if (!isValidSignature(req.body, req.get('x-hub-signature-256'))) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
    const event = req.get('x-github-event');
    const payload = JSON.parse(req.body.toString('utf8'));
    await processWebhook(event, payload);
    return res.status(202).json({ success: true });
  } catch (error) {
    return next(error);
  }
});

app.use(express.json({ limit: '1mb' }));
app.use('/api', authMiddleware);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/runs', workflowRunRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
