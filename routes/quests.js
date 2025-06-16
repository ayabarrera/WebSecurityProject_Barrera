const express = require('express');
const router = express.Router();

// GET /quests
router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=30');
  res.json([
    { id: 1, title: "Finish Web Security Phase 1 Assignment", xp: 100 },
    { id: 2, title: "Vacuum the house", xp: 20 },
  ]);
});

// GET /quests/:id
router.get('/:id', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ id: req.params.id, title: "Buy eggs", xp: 15 });
});

// POST /quests
router.post('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(201).json({ message: "Quest added", quest: req.body });
});


module.exports = router;
