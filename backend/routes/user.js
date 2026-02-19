import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/balance', authMiddleware, async (req, res, next) => {
  try {
    const username = req.user.sub;

    const [rows] = await pool.execute(
      'SELECT balance FROM kodusers WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, balance: Number(rows[0].balance) });
  } catch (err) {
    next(err);
  }
});

export default router;
