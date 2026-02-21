const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    const [rows] = await pool.execute(
      'SELECT token_id FROM CJWT WHERE token = ? AND expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Token expired or invalid' });
    }

    req.user = { username: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    next(err);
  }
}

module.exports = authMiddleware;
