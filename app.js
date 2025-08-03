const fs = require("fs");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", "./views");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Middleware
app.use(express.urlencoded({ extended: false })); // ⬅️ Add this for form data
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Helmet security headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'"],
    },
  })
);
app.use(helmet.frameguard({ action: "deny" }));
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);

// Rate limiting for login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});
app.use("/auth/login", limiter);

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    },
  })
);

// Passport setup
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// CSRF middleware with exclusions
const csrfMiddleware = require("./middleware/csrf-exclude");
app.use(csrfMiddleware);

// CSRF token endpoint for client-side use
app.get("/auth/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes

// IMPORTANT CHANGE: The profile.js file now exports an object.
// We must destructure the 'router' property from that object.
const { router: profileRoute } = require("./routes/profile");

const questsRoute = require("./routes/quests");
const guildsRoute = require("./routes/guilds");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const protectedRoutes = require("./routes/protected");

app.use("/quests", questsRoute);
app.use("/profile", profileRoute);
app.use("/guilds", guildsRoute);
app.use("/auth", authRoute);
app.use("/dashboard", dashboardRoute);
app.use("/", protectedRoutes);

// Default route
app.get("/", (req, res) => {
  res.send(`<h1>Hello from a secure Server</h1>`);
});

// HTTPS Server
const credentials = {
  key: fs.readFileSync("./cert/server.key"),
  cert: fs.readFileSync("./cert/server.cert"),
};

https.createServer(credentials, app).listen(3000, () => {
  console.log("HTTPS Server running at https://localhost:3000");
});