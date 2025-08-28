const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, '../../db/school.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tables
const createTables = () => {
    return new Promise((resolve, reject) => {
        // Create students table
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            class TEXT NOT NULL,
            email TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating students table:', err.message);
                reject(err);
            } else {
                console.log('Students table created successfully.');
            }
        });

        // Create courses table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            credits INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating courses table:', err.message);
                reject(err);
            } else {
                console.log('Courses table created successfully.');
            }
        });

        // Create enrollments table
        db.run(`CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating enrollments table:', err.message);
                reject(err);
            } else {
                console.log('Enrollments table created successfully.');
            }
        });

        // Create admin users table
        db.run(`CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating admin_users table:', err.message);
                reject(err);
            } else {
                console.log('Admin users table created successfully.');
                resolve();
            }
        });
    });
};

// Insert sample data
const insertSampleData = async () => {
    return new Promise((resolve, reject) => {
        // Hash the default admin password
        const hashedPassword = bcrypt.hashSync('admin123', 10);

        // Insert default admin user
        db.run(`INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)`, 
            ['admin', hashedPassword], (err) => {
            if (err) {
                console.error('Error inserting admin user:', err.message);
                reject(err);
            } else {
                console.log('Default admin user created (username: admin, password: admin123)');
            }
        });

        // Insert sample students
        const sampleStudents = [
            ['John Doe', 20, 'Computer Science', 'john@example.com'],
            ['Jane Smith', 19, 'Mathematics', 'jane@example.com'],
            ['Mike Johnson', 21, 'Physics', 'mike@example.com'],
            ['Sarah Wilson', 20, 'Chemistry', 'sarah@example.com'],
            ['David Brown', 22, 'Biology', 'david@example.com']
        ];

        sampleStudents.forEach((student, index) => {
            db.run(`INSERT OR IGNORE INTO students (name, age, class, email) VALUES (?, ?, ?, ?)`, 
                student, (err) => {
                if (err) {
                    console.error('Error inserting sample student:', err.message);
                } else if (index === sampleStudents.length - 1) {
                    console.log('Sample students inserted successfully.');
                }
            });
        });

        // Insert sample courses
        const sampleCourses = [
            ['CS101', 'Introduction to Computer Science', 3],
            ['MATH201', 'Calculus I', 4],
            ['PHYS101', 'Physics Fundamentals', 3],
            ['CHEM101', 'General Chemistry', 4],
            ['BIO101', 'Introduction to Biology', 3],
            ['ENG101', 'English Composition', 3],
            ['HIST101', 'World History', 3],
            ['ART101', 'Art Appreciation', 2]
        ];

        sampleCourses.forEach((course, index) => {
            db.run(`INSERT OR IGNORE INTO courses (code, title, credits) VALUES (?, ?, ?)`, 
                course, (err) => {
                if (err) {
                    console.error('Error inserting sample course:', err.message);
                } else if (index === sampleCourses.length - 1) {
                    console.log('Sample courses inserted successfully.');
                }
            });
        });

        // Insert sample enrollments
        const sampleEnrollments = [
            [1, 1], // John Doe in CS101
            [1, 2], // John Doe in MATH201
            [2, 2], // Jane Smith in MATH201
            [2, 3], // Jane Smith in PHYS101
            [3, 3], // Mike Johnson in PHYS101
            [3, 4], // Mike Johnson in CHEM101
            [4, 4], // Sarah Wilson in CHEM101
            [4, 5], // Sarah Wilson in BIO101
            [5, 5], // David Brown in BIO101
            [5, 1]  // David Brown in CS101
        ];

        sampleEnrollments.forEach((enrollment, index) => {
            db.run(`INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)`, 
                enrollment, (err) => {
                if (err) {
                    console.error('Error inserting sample enrollment:', err.message);
                } else if (index === sampleEnrollments.length - 1) {
                    console.log('Sample enrollments inserted successfully.');
                    resolve();
                }
            });
        });
    });
};

// Initialize database
const initializeDatabase = async () => {
    try {
        await createTables();
        await insertSampleData();
        console.log('Database initialization completed successfully!');
        console.log('\nDefault admin credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nYou can now start the server with: npm start');
    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

// Run initialization
initializeDatabase();
