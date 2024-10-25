const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    console.log('Incoming request headers:', req.headers);

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(401).json({ error: 'Token expired or invalid' }); // Changed to provide a message
            }
            req.user = user; // Attach user information to req
            next();
        });
    } else {
        console.warn('No token provided');
        res.status(401).json({ error: 'No token provided' }); // Provide a message for no token
    }
};

module.exports = authenticateJWT;
