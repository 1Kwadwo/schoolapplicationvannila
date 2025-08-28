const express = require('express');
const { getAll, getRow, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await getAll('SELECT * FROM courses ORDER BY code');
        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses'
        });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await getRow('SELECT * FROM courses WHERE id = ?', [id]);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course'
        });
    }
});

// Create new course
router.post('/', async (req, res) => {
    try {
        const { code, title, credits } = req.body;

        // Validate required fields
        if (!code || !title || !credits) {
            return res.status(400).json({
                success: false,
                message: 'Code, title, and credits are required'
            });
        }

        // Validate credits
        if (credits < 1 || credits > 10) {
            return res.status(400).json({
                success: false,
                message: 'Credits must be between 1 and 10'
            });
        }

        // Check if course code already exists
        const existingCourse = await getRow(
            'SELECT id FROM courses WHERE code = ?',
            [code]
        );
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course code already exists'
            });
        }

        // Insert new course
        const result = await runQuery(
            'INSERT INTO courses (code, title, credits) VALUES (?, ?, ?)',
            [code, title, credits]
        );

        // Get the created course
        const newCourse = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: newCourse
        });

    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course'
        });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, title, credits } = req.body;

        // Check if course exists
        const existingCourse = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [id]
        );

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Validate required fields
        if (!code || !title || !credits) {
            return res.status(400).json({
                success: false,
                message: 'Code, title, and credits are required'
            });
        }

        // Validate credits
        if (credits < 1 || credits > 10) {
            return res.status(400).json({
                success: false,
                message: 'Credits must be between 1 and 10'
            });
        }

        // Check if course code already exists (if different from current)
        if (code !== existingCourse.code) {
            const codeExists = await getRow(
                'SELECT id FROM courses WHERE code = ? AND id != ?',
                [code, id]
            );
            if (codeExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Course code already exists'
                });
            }
        }

        // Update course
        await runQuery(
            'UPDATE courses SET code = ?, title = ?, credits = ? WHERE id = ?',
            [code, title, credits, id]
        );

        // Get the updated course
        const updatedCourse = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
        });

    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course'
        });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const existingCourse = await getRow(
            'SELECT * FROM courses WHERE id = ?',
            [id]
        );

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if course has enrollments
        const enrollments = await getAll(
            'SELECT * FROM enrollments WHERE course_id = ?',
            [id]
        );

        if (enrollments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete course with existing enrollments'
            });
        }

        // Delete course
        await runQuery('DELETE FROM courses WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course'
        });
    }
});

module.exports = router;
