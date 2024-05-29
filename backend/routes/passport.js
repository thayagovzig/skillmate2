const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback", // Update callback URL
  passReqToCallback: true,
  scope: ['openid', 'profile', 'email'] // Add the scope parameter here
}, async (req, accessToken, refreshToken, profile, cb) => {
  console.log("Google OAuth Request:", req);
  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
  console.log("Profile:", profile);

  const defaultUser = {
    name: `${profile.name.givenName} ${profile.name.familyName}`,
    email: profile.emails[0].value,
    phone:"",
    password:"",
    googleID: profile.id
  };

  try {
    let user = await User.findOne({ googleID: profile.id });
    if (!user) {
      user = new User(defaultUser);
      await user.save();
    }
    console.log("User found or created:", user);
    cb(null, user);
  } catch (err) {
    console.log("ERROR SIGNING UP", err);
    cb(err, null);
  }
}));

passport.serializeUser((user, cb) => {
  console.log("Serializing user", user);
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id);
    console.log("Deserialized user", user);
    cb(null, user);
  } catch (err) {
    console.log("Error with deserialization", err);
    cb(err, null);
  }
});

module.exports = passport;
