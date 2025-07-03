const router = require("express").Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

router.get("/", ensureAuthenticated, (req, res) => {
  res.send(`Hello ${req.user.username}, welcome to your dashboard!`);
});

module.exports = router;