const express = require('express');
const router = express.Router();

// GET /profile
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    profile: "/images/aya.png",
    username: "Ayuhhh",
    level: 8,
    xp: 420,
    badges: ["The Fridge Forager"]
  });
});

module.exports = router;
