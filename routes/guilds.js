const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize'); 

// GET /guilds
router.get('/', authenticate, (req, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  res.json([
    { id: 1, name: "coming soon..." },
  ]);
});

module.exports = router;
