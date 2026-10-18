export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
