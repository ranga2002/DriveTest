// Middleware to protect routes
exports.requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Middleware to protect Driver-only routes
exports.requireDriver = (req, res, next) => {
    if (req.session.userType !== 'Driver') {
        return res.status(403).send('Access denied.');
    }
    next();
};

// Middleware to protect Admin-only routes
exports.requireAdmin = (req, res, next) => {
    if (req.session.userType !== 'Admin') {
        return res.status(403).send('Access denied.');
    }
    next();
};
