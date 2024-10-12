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

router.get('/get-pending', async (req, res) => {
    try {
      console.log("get-pending executed");
      const url = new URL('https://api.todoist.com/rest/v2/tasks');
      url.searchParams.append('filter', '(today | overdue | tomorrow)');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.TODOIST_API_TOKEN}`
        }
      });
      if (response.ok) {
          const tasks = await response.json();
          // generate a list of tasks sorted by created_at and priority ascending
          // Sort tasks based on due date
          const sortedTasks = tasks.sort((a, b) => {
            // Check if due dates exist
            const dueA = a.due ? new Date(a.due.date) : Infinity; // Use Infinity if no due date
            const dueB = b.due ? new Date(b.due.date) : Infinity; // Use Infinity if no due date

            return dueA - dueB; // Sort in ascending order
          });
          res.json({ status: 'Todoist connection successful!', tasks: sortedTasks });
      } else {
          res.status(500).json({ status: 'Error checking Todoist connection', error: 'Failed to fetch tasks' });
      }
  } catch (error) {
        console.error('Error checking Todoist connection:', error); // Log the error for debugging
        res.status(500).json({ status: 'Error checking Todoist connection', error: error.message });
    }
});

router.get('/karma', async (req, res) => {
    try {
        console.log("karma executed");
        const response = await fetch('https://api.todoist.com/sync/v9/completed/get_stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.TODOIST_API_TOKEN}`
            }
        });
        if (response.ok) {
            const karma = await response.json();
            const completedCount = karma.completed_count;
            const karmaScore = karma.karma;
            const karmaDataGraph = karma.karma_graph_data;
            const karmaUpdateReasons = karma.karma_update_reasons;
            res.json({ status: 'Karma fetched successfully', completedCount: completedCount, karmaScore: karmaScore, karmaDataGraph: karmaDataGraph, karmaUpdateReasons: karmaUpdateReasons });
        } else {
            res.status(500).json({ status: 'Response not ok', error: 'Failed to fetch karma' });
        }
    } catch (error) {
        console.error('Error fetching karma:', error);
        res.status(500).json({ status: 'Error fetching karma', error: error.message }); 
    }
});

module.exports = router;