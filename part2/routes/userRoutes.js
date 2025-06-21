const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST /login - handle login form submission
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).send('Invalid login');
    }

    const user = rows[0];
    req.session.user = user;

    // Redirect based on user role
    if (user.role === 'owner') {
      res.redirect('/owner-dashboard.html');
    } else if (user.role === 'walker') {
      res.redirect('/walker-dashboard.html');
    } else {
      res.status(400).send('Unknown role');
    }

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error during login');
  }
});

module.exports = router;
