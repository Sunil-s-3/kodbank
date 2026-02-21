const express = require('express');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/user/balance - requires JWT in cookie
router.get('/balance', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT balance FROM kodusers WHERE username = ?',
      [req.user.username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, balance: rows[0].balance });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
