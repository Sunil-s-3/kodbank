const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const isProduction = process.env.NODE_ENV === 'production';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email, phone, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, error: 'username, password, and email are required' });
    }

    const userRole = role || 'Customer';
    if (userRole !== 'Customer') {
      return res.status(400).json({ success: false, error: 'Only Customer role is allowed for registration' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO kodusers (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone || null, userRole]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const [rows] = await pool.execute(
      'SELECT uid, username, password, role FROM kodusers WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { sub: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
    );

    const decoded = jwt.decode(token);
    const expiryDate = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO CJWT (token, user_id, expiry) VALUES (?, ?, ?)',
      [token, user.uid, expiryDate]
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
