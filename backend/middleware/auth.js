// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated
        res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
};

// Optional authentication middleware (for routes that can work with or without auth)
const optionalAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.isAuthenticated = true;
    } else {
        req.isAuthenticated = false;
    }
    next();
};

module.exports = {
    requireAuth,
    optionalAuth
};
