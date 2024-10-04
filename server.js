const express = require('express');
const path = require('path');
const app = express();

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your files are in a 'public' folder

// Route for serving the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src','front-end', 'pages', 'landing.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));