const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '6h' });

  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true if in production
    sameSite: 'strict',
    maxAge: 6 * 60 * 60 * 1000 // 6 hours
  });

  return res.json({ success: true, message: 'Logged in successfully' });
});

// Admin logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.json({ success: true, message: 'Logged out' });
});

// Check if admin is authenticated
router.get('/check', (req, res) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
});

module.exports = router;
