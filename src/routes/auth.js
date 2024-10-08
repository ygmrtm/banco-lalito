const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Google OAuth setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
  },
  function(token, tokenSecret, profile, done) {
    // Here you would find or create a user in your DB
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Session middleware
router.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

// Google authentication route
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback route
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to main dashboard.
    console.log("User authenticated in auth.js:", req.user);
    req.session.userName = req.user._json.name;
    req.session.userEmail = req.user._json.email;
    req.session.userIcon = req.user._json.picture;
    res.redirect('/pages/main.html');
  }
);

// Route to get user info from session
router.get('/auth/user', function(req, res) {
  if (req.isAuthenticated()) {
    res.json({
      userName: req.session.userName,
      userEmail: req.session.userEmail,
      userIcon: req.session.userIcon
    });
  } else {
    res.status(401).json({ message: 'User not authenticated' });
  }
});

router.get('/auth/logout', function(req, res) {
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/'); // Redirect to home or login page after logout
  });
});

module.exports = router;
