require('dotenv').config(); // Loading environment variables from .env file

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD, // Safeguard the password
    port: process.env.DB_PORT
});

// Test the database connection
pool.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1); // Exit the process if connection fails
    } else {
        console.log('Connected to the Database successfully.');
    }
});

module.exports = pool; // Correct export statement
