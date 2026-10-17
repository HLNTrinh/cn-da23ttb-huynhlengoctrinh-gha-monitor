import { getAuthConfiguration, readSession } from '../services/authService.js';

export default function authMiddleware(req, res, next) {
  const configuration = getAuthConfiguration();
  if (configuration.enabled) {
    if (!configuration.configured) {
      return res.status(503).json({
        success: false,
        message: `GitHub login is not configured. Missing: ${configuration.missing.join(', ')}`
      });
    }
    if (!readSession(req)) {
      return res.status(401).json({ success: false, message: 'GitHub login required' });
    }
    return next();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) return next();
  const authorization = req.get('authorization') ?? '';
  if (authorization !== `Bearer ${apiKey}`) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  return next();
}
