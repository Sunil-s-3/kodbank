import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict'
  });
  res.json({ success: true });
});

router.post('/register', [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('user_name').notEmpty().trim().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').equals('customer').withMessage('Role must be customer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { user_name, password, email, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO kodusers (username, email, password, balance, phone, role) 
       VALUES (?, ?, ?, 100000, ?, 'Customer')`,
      [user_name, email, hashedPassword, phone]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      redirect: '/login'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    next(err);
  }
});

router.post('/login', [
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT uid, username, password, role FROM kodusers WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { sub: username, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: JWT_EXPIRY }
    );

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    await pool.execute('DELETE FROM CJWT WHERE expiry < NOW()');
    await pool.execute(
      'INSERT INTO CJWT (token, uid, expiry) VALUES (?, ?, ?)',
      [token, user.uid, expiryDate]
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;