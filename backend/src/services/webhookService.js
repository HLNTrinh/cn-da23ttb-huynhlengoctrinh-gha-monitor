import { createHmac, timingSafeEqual } from 'node:crypto';
import { upsertWebhookRun } from './githubService.js';

export function isValidSignature(rawBody, signature) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function processWebhook(event, payload) {
  if (!['workflow_run', 'workflow_job'].includes(event)) return null;
  return upsertWebhookRun(payload);
}
