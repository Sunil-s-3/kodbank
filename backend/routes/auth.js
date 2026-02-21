const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const isProduction = process.env.NODE_ENV === 'production';

// POST /api/auth/register
router.post("/register", async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7430/ingest/3e6faf8c-0bd8-4293-a4b5-ee47ad7ec233',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'eb2222'},body:JSON.stringify({sessionId:'eb2222',location:'auth.js:register:entry',message:'Register route hit',data:{bodyKeys:req.body?Object.keys(req.body):[]},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.log("REGISTER ROUTE HIT");
  console.log("Request body:", req.body);
  try {
    const { username, password, email, phone, role } = req.body;

    if (!username || !password || !email) {
      // #region agent log
      fetch('http://127.0.0.1:7430/ingest/3e6faf8c-0bd8-4293-a4b5-ee47ad7ec233',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'eb2222'},body:JSON.stringify({sessionId:'eb2222',location:'auth.js:register:validation',message:'Validation failed',data:{hasUsername:!!username,hasPassword:!!password,hasEmail:!!email},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      console.log("Validation failed");
      return res.status(400).json({
        success: false,
        error: "username, password and email are required"
      });
    }

    console.log("Validation passed");
    const userRole = role || 'Customer';
    if (userRole !== 'Customer') {
      return res.status(400).json({ success: false, error: 'Only Customer role is allowed for registration' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO kodusers (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone || null, userRole]
    );

    // #region agent log
    fetch('http://127.0.0.1:7430/ingest/3e6faf8c-0bd8-4293-a4b5-ee47ad7ec233',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'eb2222'},body:JSON.stringify({sessionId:'eb2222',location:'auth.js:register:insertDone',message:'User inserted successfully',data:{},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    console.log("User inserted successfully");

    return res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7430/ingest/3e6faf8c-0bd8-4293-a4b5-ee47ad7ec233',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'eb2222'},body:JSON.stringify({sessionId:'eb2222',location:'auth.js:register:catch',message:'REGISTER ERROR',data:{code:error?.code,name:error?.name},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    console.error("REGISTER ERROR:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
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
