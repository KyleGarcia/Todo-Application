const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');

// Middleware to parse JSON requests
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Testing the Database connection
pool.connect((err) => {
    if(err) {
        console.error('Failed to connect to the database', err);
    } else {
        console.log('Connected to the Database successfully.');
    }
});
