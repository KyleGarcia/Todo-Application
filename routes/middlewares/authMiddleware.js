const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    // Log the incoming request headers
    console.log('Incoming request headers:', req.headers);

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.sendStatus(403); // Forbidden
            }
            req.user = user; // Attach user information to req
            next();
        });
    } else {
        console.warn('No token provided');
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;
