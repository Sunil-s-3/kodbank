export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Request failed'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error')
  });
}
