const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorize");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/User"); // Assumes you have a User model
const escapeHtml = require("escape-html");

// Encryption keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.slice(0, 32); // 32 bytes key
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  // Add defensive check for null or undefined input
  if (!text) {
    return null;
  }
  const textParts = text.split(":");
  if (textParts.length < 2) {
      // Handle cases where the data is not in the expected encrypted format
      return text;
  }
  try {
      const iv = Buffer.from(textParts.shift(), "hex");
      const encryptedText = Buffer.from(textParts.join(":"), "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
  } catch (error) {
      console.error("Decryption error:", error);
      return "Decryption failed.";
  }
}

// Helper function to prepare user data for rendering
const prepareUserForRender = (user) => {
  if (!user) return null;
  // Use a copy of the user object to avoid modifying the original
  const decryptedUser = { ...user._doc };
  if (user.email) {
    decryptedUser.email = decrypt(user.email);
  }
  if (user.bio) {
    decryptedUser.bio = decrypt(user.bio);
  }
  return decryptedUser;
};

// Route: renders the profile update form
router.get("/", authenticate, authorizeRoles("User"), (req, res) => {
  res.set("Cache-Control", "no-store");
  const decryptedUser = prepareUserForRender(req.authUser);
  res.render("profile", {
    user: decryptedUser,
    csrfToken: req.csrfToken(),
    errors: [],
    success: false,
  });
});

// Route: Handle profile update
router.post(
  "/update",
  authenticate,
  authorizeRoles("User"),
  [
    body("name")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name must be 3–50 characters long")
      .isAlpha("en-US", { ignore: " -" })
      .withMessage("Name must contain only letters")
      .escape(), // Sanitizes the name for storage
    body("email")
      .isEmail()
      .withMessage("Enter a valid email")
      .normalizeEmail(),
    body("bio")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must be under 500 characters")
      .blacklist("<>"), // Removes HTML tags
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const decryptedUser = prepareUserForRender(req.authUser);
      return res.status(400).render("profile", {
        user: decryptedUser,
        errors: errors.array(),
        csrfToken: req.csrfToken(),
        success: false,
      });
    }

    try {
      const { name, email, bio } = req.body;

      // Encrypt email and bio before saving
      const encryptedEmail = encrypt(email);
      const encryptedBio = encrypt(bio);

      // Update user in DB
      await User.findByIdAndUpdate(req.authUser._id, {
        name: name, // Name is already sanitized by express-validator
        email: encryptedEmail,
        bio: encryptedBio,
      });

      // Update req.authUser for the current request
      req.authUser.name = name;
      req.authUser.email = encryptedEmail;
      req.authUser.bio = encryptedBio;

      const decryptedUser = prepareUserForRender(req.authUser);
      res.render("profile", {
        user: decryptedUser,
        csrfToken: req.csrfToken(),
        errors: [],
        success: true,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).send("Something went wrong.");
    }
  }
);

/**
 * The key change is here. Instead of exporting the router directly,
 * we export an object containing the router and the functions needed by other modules.
 * This resolves the "decrypt is not a function" error in dashboard.js.
 */
module.exports = {
  router: router,
  encrypt: encrypt,
  decrypt: decrypt,
  prepareUserForRender: prepareUserForRender,
};