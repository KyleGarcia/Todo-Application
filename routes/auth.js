const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Dummy login for now
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // You should replace this with real DB logic
    if (username === 'admin' && password === '1234') {
        const user = { username };
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
