const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const passportGoogleSSO = require("./routes/passportGoogleSSO");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("dotenv").config();
require("./routes/passport"); // Ensure this is required to configure Passport
const mfaRouter = require('./routes/mfa');
const PORT = 3000;

const DB = "YOUR_MONGODB_URL";


const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Cookie Session Configuration
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  keys: [process.env.COOKIE_KEY]
}));
app.use(function(request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb()
    }
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb()
    }
  }
  next()
})
console.log("THE SESSION KEY IS :---",cookieSession);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use('/mfa', mfaRouter);
// Routes
app.use(authRouter);
app.use(passportGoogleSSO); // Ensure the SSO router is used


// Database Connection
mongoose.connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at port ${PORT}`);
});
