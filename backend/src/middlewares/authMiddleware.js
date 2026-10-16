export default function authMiddleware(req, res, next) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return next();
  const authorization = req.get('authorization') ?? '';
  if (authorization !== `Bearer ${apiKey}`) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  return next();
}
