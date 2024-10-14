const express = require('express');
const path = require('path');
const passport = require('passport'); // Assuming you're using passport for authentication
const session = require('express-session'); // Import express-session
const crypto = require('crypto'); // Import crypto for generating a secret key
const authRoutes = require('./src/routes/auth'); // Import your auth routes
const financialRoutes = require('./src/backend/services/financial'); // Import financial routes
const todoistRoutes = require('./src/backend/controllers/todoist'); // Import todoist routes
const { router: notionRoutes } = require('./src/backend/controllers/notion'); // Import notion routes
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Generate a random secret key (for demonstration purposes)
const secretKey = crypto.randomBytes(32).toString('hex'); // Generate a secure random key

// Serve static files from 'public/front-end'
app.use(express.static(path.join(__dirname, 'public', 'front-end')));

// Set up session middleware
app.use(session({
  secret: secretKey, // Use the generated secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use the authentication routes
app.use(authRoutes); // Add this line to use your auth routes
// Use the financial routes// Use the financial routes
app.use('/api', financialRoutes); // Prefix the financial routes with /api
app.use('/todoist', todoistRoutes); // Prefix the todoist routes with /todoist
app.use('/notion', notionRoutes); // Prefix the notion routes with /notion
// Route for serving the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end', 'pages', 'landing.html'));
});

app.get('/card/:name', (req, res) => {
  // In a real app, you'd fetch this data from a database
  const cardData = {
    name: req.params.name,
    manaCost: '2U',
    type: 'Creature — Spirit',
    text: 'Flying\n\nWhen Ethereal Guardian enters the battlefield, you may return target creature to its owner\'s hand.',
    flavorText: '"Its presence alone can unravel the fabric of reality."',
    artist: 'A. Artist',
    power: 2,
    toughness: 3
  };

  res.render('mtg-card', cardData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));