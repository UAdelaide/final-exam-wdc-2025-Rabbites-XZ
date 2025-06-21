const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (done version)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query(
    'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
    [username, password]
  );
  if (rows.length === 0) return res.status(401).send('Invalid login');

  const user = rows[0];
  req.session.user = user;

  if (user.role === 'owner') {
    res.redirect('/owner-dashboard.html');
  } else {
    res.redirect('/walker-dashboard.html');
  }

});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid'); // clears session cookie
    res.redirect('/');
  });
});

//GET /api/my-dogs
router.get('/api/my-dogs', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(403).send('Not authorized');
  }

  const ownerId = req.session.user.user_id;

  try {
    const [rows] = await db.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [ownerId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch dogs:', err);
    res.status(500).send('Server error');
  }
});
//GET /api/users/me
// GET /api/users/me - return current logged-in user's ID and username
router.get('/api/users/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not logged in');
  }

  const { user_id, username, role } = req.session.user;
  res.json({ user_id, username, role });
});




module.exports = router;