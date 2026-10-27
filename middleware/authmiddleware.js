var jwt = require('jsonwebtoken');

const SECRET = 'RBAC12456';

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = decoded; // { userId, role }
        next();
    });
}


function authenticateAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
}

function authenticateManager(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
}

function authenticateStudent(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!['admin', 'manager', 'student'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
}

module.exports = {
    authenticateJWT,
    authenticateAdmin,
    authenticateManager,
    authenticateStudent
};
