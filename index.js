require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db/db');
const cors = require('cors');
const usersRoutes = require('./routes/users') // Import users routes
const tasksRoutes = require('./routes/tasks'); // Import tasks routes
const categoriesRoutes = require('./routes/categories'); // Import categories routes

// Enable cors for server interaction
app.use(cors({
  origin: 'http://localhost:3002', 

}));

// Middleware to parse JSON requests
app.use(express.json());

//Use the users routes
app.use('/api/users', usersRoutes);

// Use the tasks routes
app.use('/api/tasks', tasksRoutes);

// Use the categories routes
app.use('/api/categories', categoriesRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hello, TODO list!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
