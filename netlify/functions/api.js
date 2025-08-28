const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

// Import routes
const authRoutes = require('../../backend/routes/auth');
const studentsRoutes = require('../../backend/routes/students');
const coursesRoutes = require('../../backend/routes/courses');
const enrollmentsRoutes = require('../../backend/routes/enrollments');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { getAll } = require('../../backend/database/db');
        
        // Get counts
        const studentsCount = await getAll('SELECT COUNT(*) as count FROM students');
        const coursesCount = await getAll('SELECT COUNT(*) as count FROM courses');
        const enrollmentsCount = await getAll('SELECT COUNT(*) as count FROM enrollments');
        
        // Get recent enrollments
        const recentEnrollments = await getAll(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.name as student_name,
                s.email as student_email,
                c.code as course_code,
                c.title as course_title
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrollment_date DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                students: studentsCount[0].count,
                courses: coursesCount[0].count,
                enrollments: enrollmentsCount[0].count,
                recentEnrollments
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export for Netlify serverless functions
module.exports.handler = serverless(app);
