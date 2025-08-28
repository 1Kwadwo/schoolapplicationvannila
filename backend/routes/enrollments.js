const express = require('express');
const { getAll, getRow, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all enrollments with student and course details
router.get('/', async (req, res) => {
    try {
        const enrollments = await getAll(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.id as student_id,
                s.name as student_name,
                s.email as student_email,
                c.id as course_id,
                c.code as course_code,
                c.title as course_title,
                c.credits
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrollment_date DESC
        `);
        
        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollments'
        });
    }
});

// Get single enrollment
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await getRow(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.id as student_id,
                s.name as student_name,
                s.email as student_email,
                c.id as course_id,
                c.code as course_code,
                c.title as course_title,
                c.credits
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `, [id]);
        
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment'
        });
    }
});

// Create new enrollment
router.post('/', async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        // Validate required fields
        if (!student_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Course ID are required'
            });
        }

        // Check if student exists
        const student = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [student_id]
        );
        if (!student) {
            return res.status(400).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if course exists
        const course = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [course_id]
        );
        if (!course) {
            return res.status(400).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if enrollment already exists
        const existingEnrollment = await getRow(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Student is already enrolled in this course'
            });
        }

        // Insert new enrollment
        const result = await runQuery(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student_id, course_id]
        );

        // Get the created enrollment with details
        const newEnrollment = await getRow(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.id as student_id,
                s.name as student_name,
                s.email as student_email,
                c.id as course_id,
                c.code as course_code,
                c.title as course_title,
                c.credits
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `, [result.id]);

        res.status(201).json({
            success: true,
            message: 'Enrollment created successfully',
            data: newEnrollment
        });

    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating enrollment'
        });
    }
});

// Update enrollment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { student_id, course_id } = req.body;

        // Check if enrollment exists
        const existingEnrollment = await getRow(
            'SELECT * FROM enrollments WHERE id = ?',
            [id]
        );

        if (!existingEnrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Validate required fields
        if (!student_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Course ID are required'
            });
        }

        // Check if student exists
        const student = await getRow(
            'SELECT * FROM students WHERE id = ?',
            [student_id]
        );
        if (!student) {
            return res.status(400).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if course exists
        const course = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [course_id]
        );
        if (!course) {
            return res.status(400).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if enrollment already exists (if different from current)
        if (student_id !== existingEnrollment.student_id || course_id !== existingEnrollment.course_id) {
            const duplicateEnrollment = await getRow(
                'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ? AND id != ?',
                [student_id, course_id, id]
            );
            if (duplicateEnrollment) {
                return res.status(400).json({
                    success: false,
                    message: 'Student is already enrolled in this course'
                });
            }
        }

        // Update enrollment
        await runQuery(
            'UPDATE enrollments SET student_id = ?, course_id = ? WHERE id = ?',
            [student_id, course_id, id]
        );

        // Get the updated enrollment with details
        const updatedEnrollment = await getRow(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.id as student_id,
                s.name as student_name,
                s.email as student_email,
                c.id as course_id,
                c.code as course_code,
                c.title as course_title,
                c.credits
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Enrollment updated successfully',
            data: updatedEnrollment
        });

    } catch (error) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating enrollment'
        });
    }
});

// Delete enrollment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if enrollment exists
        const existingEnrollment = await getRow(
            'SELECT * FROM enrollments WHERE id = ?',
            [id]
        );

        if (!existingEnrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Delete enrollment
        await runQuery('DELETE FROM enrollments WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Enrollment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting enrollment'
        });
    }
});

// Get enrollments by student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const enrollments = await getAll(`
            SELECT 
                e.id,
                e.enrollment_date,
                c.id as course_id,
                c.code as course_code,
                c.title as course_title,
                c.credits
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
            ORDER BY e.enrollment_date DESC
        `, [studentId]);
        
        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student enrollments'
        });
    }
});

// Get enrollments by course
router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const enrollments = await getAll(`
            SELECT 
                e.id,
                e.enrollment_date,
                s.id as student_id,
                s.name as student_name,
                s.email as student_email
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE e.course_id = ?
            ORDER BY e.enrollment_date DESC
        `, [courseId]);
        
        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('Error fetching course enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course enrollments'
        });
    }
});

module.exports = router;
