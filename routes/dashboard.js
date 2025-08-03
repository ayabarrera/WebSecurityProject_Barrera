// dashboard.js

const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorize");
const escape = require("escape-html");
// Correctly import the decrypt function from the exported object
const { decrypt } = require("../routes/profile"); 

router.get("/", authenticate, authorizeRoles("User", "Admin", "Moderator"), (req, res) => {
  const user = req.authUser;
  let decryptedEmail = "";

  if (user && user.email) {
    try {
      decryptedEmail = decrypt(user.email);
    } catch (error) {
      // The decryption might fail for new users who don't have an encrypted email yet.
      // In that case, you can just use the original value or a default.
      console.error("Failed to decrypt user email:", error);
      decryptedEmail = user.email; // Fallback to the original value
    }
  }

  res.render("dashboard", {
    username: escape(user.username),
    email: escape(decryptedEmail),
  });
});

module.exports = router;