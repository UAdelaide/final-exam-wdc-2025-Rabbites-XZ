const express = require('express');
const router = express.Router();
const db = require('../modles/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    const user = rows[0];
    req.session.user = user;

    if (user.role === 'owner') {
      res.redirect('/owner-dashboard.html');
    } else if (user.role === 'walker') {
      res.redirect('/walker-dashboard.html');
    } else {
      res.status(400).send('Unknown role');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
