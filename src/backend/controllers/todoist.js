const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Middleware function
const myMiddleware = (req, res, next) => {
    console.log('Middleware executed');
    next(); // Pass control to the next middleware
};

// Use middleware
router.use(myMiddleware);

router.get('/health-check', async (req, res) => {
    try {
        let responseString = '';
        console.log("health-check executed");
        const response = await fetch('https://api.todoist.com/rest/v2/projects', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${process.env.TODOIST_API_TOKEN}` // Replace with your actual API token
            }
          });

          if (response.ok) {
            responseString = responseString.concat('| ', 'Todoist connection [✅]');
          } else {
            responseString = responseString.concat('| ', 'Todoist connection [❌]');
          }
        
        res.json({ status: responseString });
    } catch (error) {
        console.error('Health check error:', error); // Log the error for debugging
        res.status(500).json({ status: 'Health check error', error: error.message });
    }
});

router.get('/process', async (req, res) => {
    try {
      console.log("health-check executed");
      const response = await fetch('https://api.todoist.com/rest/v2/projects', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.TODOIST_API_TOKEN}` // Replace with your actual API token
          }
        });

        if (response.ok) {
            const projects = await response.json();
            res.json({ status: 'Todoist connection successful!', projects: projects.length });
        } else {
            res.status(500).json({ status: 'Error checking Todoist connection', error: 'Failed to fetch projects' });
        }
    } catch (error) {
        console.error('Error checking Todoist connection:', error); // Log the error for debugging
        res.status(500).json({ status: 'Error checking Todoist connection', error: error.message });
    }
});

module.exports = router;