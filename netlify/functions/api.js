const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database setup for Netlify Functions
const dbPath = path.join(__dirname, 'school.db');
let db;

// Initialize database if it doesn't exist
const initializeDatabase = () => {
    if (!fs.existsSync(dbPath)) {
        console.log('Creating new database...');
        db = new sqlite3.Database(dbPath);
        
        // Create tables
        db.serialize(() => {
            // Students table
            db.run(`CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                class TEXT NOT NULL,
                email TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Courses table
            db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                credits INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Enrollments table
            db.run(`CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (course_id) REFERENCES courses(id)
            )`);

            // Insert sample data
            const sampleStudents = [
                ['John Doe', 20, 'Computer Science', 'john@example.com'],
                ['Jane Smith', 19, 'Mathematics', 'jane@example.com'],
                ['Mike Johnson', 21, 'Physics', 'mike@example.com'],
                ['Sarah Wilson', 20, 'Chemistry', 'sarah@example.com'],
                ['David Brown', 22, 'Biology', 'david@example.com']
            ];

            const sampleCourses = [
                ['CS101', 'Introduction to Computer Science', 3],
                ['MATH201', 'Calculus I', 4],
                ['PHYS101', 'Physics Fundamentals', 3],
                ['CHEM101', 'General Chemistry', 4],
                ['BIO101', 'Introduction to Biology', 3]
            ];

            const sampleEnrollments = [
                [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 1]
            ];

            // Insert sample data
            sampleStudents.forEach(student => {
                db.run(`INSERT OR IGNORE INTO students (name, age, class, email) VALUES (?, ?, ?, ?)`, student);
            });

            sampleCourses.forEach(course => {
                db.run(`INSERT OR IGNORE INTO courses (code, title, credits) VALUES (?, ?, ?)`, course);
            });

            sampleEnrollments.forEach(enrollment => {
                db.run(`INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)`, enrollment);
            });
        });
    } else {
        db = new sqlite3.Database(dbPath);
    }
    
    db.run('PRAGMA foreign_keys = ON');
};

// Initialize database
initializeDatabase();

// Helper functions
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const getRow = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

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

// Students routes
app.get('/api/students', async (req, res) => {
    try {
        const students = await getAll('SELECT * FROM students ORDER BY created_at DESC');
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { name, age, class: className, email } = req.body;
        const result = await runQuery(
            'INSERT INTO students (name, age, class, email) VALUES (?, ?, ?, ?)',
            [name, age, className, email]
        );
        res.json({ success: true, data: { id: result.id } });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ success: false, message: 'Error creating student' });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, class: className, email } = req.body;
        await runQuery(
            'UPDATE students SET name = ?, age = ?, class = ?, email = ? WHERE id = ?',
            [name, age, className, email, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, message: 'Error updating student' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runQuery('DELETE FROM students WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'Error deleting student' });
    }
});

// Courses routes
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await getAll('SELECT * FROM courses ORDER BY created_at DESC');
        res.json({ success: true, data: courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Error fetching courses' });
    }
});

app.post('/api/courses', async (req, res) => {
    try {
        const { code, title, credits } = req.body;
        const result = await runQuery(
            'INSERT INTO courses (code, title, credits) VALUES (?, ?, ?)',
            [code, title, credits]
        );
        res.json({ success: true, data: { id: result.id } });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ success: false, message: 'Error creating course' });
    }
});

app.put('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, title, credits } = req.body;
        await runQuery(
            'UPDATE courses SET code = ?, title = ?, credits = ? WHERE id = ?',
            [code, title, credits, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, message: 'Error updating course' });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runQuery('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ success: false, message: 'Error deleting course' });
    }
});

// Enrollments routes
app.get('/api/enrollments', async (req, res) => {
    try {
        const enrollments = await getAll(`
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
        `);
        res.json({ success: true, data: enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ success: false, message: 'Error fetching enrollments' });
    }
});

app.post('/api/enrollments', async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const result = await runQuery(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student_id, course_id]
        );
        res.json({ success: true, data: { id: result.id } });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({ success: false, message: 'Error creating enrollment' });
    }
});

app.delete('/api/enrollments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runQuery('DELETE FROM enrollments WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({ success: false, message: 'Error deleting enrollment' });
    }
});

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
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
