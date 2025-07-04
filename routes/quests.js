const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');

// Apply authenticate to all routes
router.use(authenticate);

// GET /quests - accessible to User and Admin roles
router.get('/', authorizeRoles('User', 'Admin'), (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=30');
  res.json([
    { id: 1, title: "Finish Web Security Phase 1 Assignment", xp: 100 },
    { id: 2, title: "Vacuum the house", xp: 20 },
  ]);
});

// GET /quests/:id - accessible to User and Admin
router.get('/:id', authorizeRoles('User', 'Admin'), (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ id: req.params.id, title: "Buy eggs", xp: 15 });
});

// POST /quests - only Admin can add quests
router.post('/', authorizeRoles('Admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(201).json({ message: "Quest added", quest: req.body });
});

module.exports = router;
