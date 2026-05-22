require('dotenv').config();
const express = require('express');
const path = require('path');
const { router: notionRoutes } = require('./src/backend/controllers/notion'); // Import notion routes
const financialRoutes = require('./src/backend/services/financial'); // Import financial routes
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'public/front-end'
app.use(express.static(path.join(__dirname, 'public', 'front-end')));

// Use the financial and notion routes directly without authentication
app.use('/api', financialRoutes); 
app.use('/notion', notionRoutes); 

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