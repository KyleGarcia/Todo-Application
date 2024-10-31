require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs'); 
const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();

// Creating a noemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

// Registering a User
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    // Validation
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, hashedPassword, email]);
        
        const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ userId: result.rows[0].id, token, email: result.rows[0].email });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logging in a User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ userId: user.id, token, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Password Reset Request
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });    
        }

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        // Sending The Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${resetLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending email' });
            }
            res.status(200).json({ message: 'Password reset link sent to your email' });
        });
    } catch (err) {
        console.error('Error in password reset request:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Password Reset
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
});

module.exports = router;
