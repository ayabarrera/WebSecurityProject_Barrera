const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');

// Accessible only to Admins
router.get('/admin', authenticate, authorizeRoles('Admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

// Accessible only to Moderators
router.get('/moderator', authenticate, authorizeRoles('Moderator'), (req, res) => {
  res.json({ message: 'Welcome Moderator!' });
});

// Accessible to Users, Admins, and Moderators
router.get('/profile', authenticate, authorizeRoles('User', 'Admin', 'Moderator'), (req, res) => {
  res.json({ message: `Welcome ${req.authUser.username}`, user: req.authUser });
});

// Dashboard accessible to all roles, but UI logic differs
router.get('/dashboard', authenticate, (req, res) => {
  const { role } = req.authUser;

  if (role === 'Admin') {
    return res.json({ message: 'Admin Dashboard', features: ['Manage Users', 'Analytics'] });
  } else if (role === 'Moderator') {
    return res.json({ message: 'Moderator Dashboard', features: ['Review Content'] });
  } else {
    return res.json({ message: 'User Dashboard', features: ['Track Quests'] });
  }
});

module.exports = router;
