const express = require('express');
const { getAll, getRow, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await getAll('SELECT * FROM students ORDER BY name');
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// Get single student
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await getRow('SELECT * FROM students WHERE id = ?', [id]);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        const { name, age, class: className, email } = req.body;

        // Validate required fields
        if (!name || !age || !className) {
            return res.status(400).json({
                success: false,
                message: 'Name, age, and class are required'
            });
        }

        // Validate age
        if (age < 1 || age > 100) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 1 and 100'
            });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingStudent = await getRow(
                'SELECT id FROM students WHERE email = ?',
                [email]
            );
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Insert new student
        const result = await runQuery(
            'INSERT INTO students (name, age, class, email) VALUES (?, ?, ?, ?)',
            [name, age, className, email]
        );

        // Get the created student
        const newStudent = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent
        });

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student'
        });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, class: className, email } = req.body;

        // Check if student exists
        const existingStudent = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Validate required fields
        if (!name || !age || !className) {
            return res.status(400).json({
                success: false,
                message: 'Name, age, and class are required'
            });
        }

        // Validate age
        if (age < 1 || age > 100) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 1 and 100'
            });
        }

        // Check if email already exists (if provided and different from current)
        if (email && email !== existingStudent.email) {
            const emailExists = await getRow(
                'SELECT id FROM students WHERE email = ? AND id != ?',
                [email, id]
            );
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update student
        await runQuery(
            'UPDATE students SET name = ?, age = ?, class = ?, email = ? WHERE id = ?',
            [name, age, className, email, id]
        );

        // Get the updated student
        const updatedStudent = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student'
        });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const existingStudent = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if student has enrollments
        const enrollments = await getAll(
            'SELECT * FROM enrollments WHERE student_id = ?',
            [id]
        );

        if (enrollments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete student with existing enrollments'
            });
        }

        // Delete student
        await runQuery('DELETE FROM students WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
});

module.exports = router;
