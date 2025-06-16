const express = require('express');
const router = express.Router();

// GET /guilds
router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  res.json([
    { id: 1, name: "coming soon..."},
  ]);
});

module.exports = router;
