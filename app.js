const fs = require("fs");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const rateLimit = require("express-rate-limit");


require("dotenv").config(); // load .env variables

const app = express();

// Connect to MongoDB 
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Middleware Setup

app.use(express.json());
app.use(cookieParser());

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

//CSURF
// Basic rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 login attempts allowed per 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests, please try again later.",
  },
});

// Apply rate limiter to login requests
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
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
  })
);

// Initialize Passport and restore authentication state
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static("public"));

//CSURF
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Routes
const questsRoute = require("./routes/quests");
const profileRoute = require("./routes/profile");
const guildsRoute = require("./routes/guilds");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const protectedRoutes = require('./routes/protected');


app.use("/quests", questsRoute);
app.use("/profile", profileRoute);
app.use("/guilds", guildsRoute);
app.use("/auth", authRoute);
app.use("/dashboard", dashboardRoute);
app.use('/', protectedRoutes);


// SSL cert keys
const credentials = {
  key: fs.readFileSync("./cert/server.key"),
  cert: fs.readFileSync("./cert/server.cert"),
};

app.get("/", (req, res) => {
  res.send(`
    <h1>Hello from a secure Server</h1> 
  `);
});

// Start HTTPS server
https.createServer(credentials, app).listen(3000, () => {
  console.log("HTTPS Server running at https://localhost:3000");
});
