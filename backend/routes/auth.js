const express = require('express');
const bcrypt = require('bcryptjs');
const { getRow } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user in database
        const user = await getRow(
            'SELECT * FROM admin_users WHERE username = ?',
            [username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check authentication status
router.get('/check', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

module.exports = router;
