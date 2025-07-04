const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');

// GET /profile — only authenticated users with role 'User' can access
router.get('/', authenticate, authorizeRoles('User'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    profile: "/images/aya.png",
    username: req.authUser.username,
    level: 8,
    xp: 420,
    badges: ["The Fridge Forager"],
  });
});

module.exports = router;
