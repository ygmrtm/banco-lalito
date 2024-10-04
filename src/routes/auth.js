const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const router = express.Router();

// Google OAuth setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
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
    res.redirect('/src/front-end/pages/main.html');
  }
);

module.exports = router;
