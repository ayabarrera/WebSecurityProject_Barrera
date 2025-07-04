const router = require("express").Router();
const authenticate = require("../middleware/authenticate"); // import your JWT auth middleware
const authorizeRoles = require("../middleware/authorize");

router.get("/", authenticate, authorizeRoles("User", "Admin", "Moderator"), (req, res) => {
  res.send(`Hello ${req.authUser.username}, welcome to your dashboard!`);
});

module.exports = router;
