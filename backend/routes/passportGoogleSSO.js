const passport = require("passport");
const express = require("express");
const router = express.Router();

router.get("/auth/google", passport.authenticate("google", {
  scope: ["openid", "profile", "email"]
}));

router.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/googlelogin/error",
  successRedirect: "/googlelogin/success"
}), (req, res) => {
  console.log("User:", req.user);
  res.send("Thank you for signing in");
});

module.exports = router;
