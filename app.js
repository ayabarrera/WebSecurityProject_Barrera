const fs = require("fs");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const app = express();

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'"], //add for images
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

app.use(express.json());

// routes quest profile and guild
const questsRoute = require("./routes/quests");
const profileRoute = require("./routes/profile");
const guildsRoute = require("./routes/guilds");

app.use(express.static('public'));
app.use("/quests", questsRoute);
app.use("/profile", profileRoute);
app.use("/guilds", guildsRoute);

// cert keys
const credentials = {
  key: fs.readFileSync("./cert/server.key"),
  cert: fs.readFileSync("./cert/server.cert"),
};

app.get("/", (req, res) => {
  res.send(`
    <h1>Hello from a secure Server</h1> 
  `);
});

https.createServer(credentials, app).listen(3000, () => {
  console.log("HTTPS Server running at https://localhost:3000");
});
