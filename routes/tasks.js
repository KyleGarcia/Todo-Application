const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const authenticateJWT = require('./middlewares/authMiddleware');

// Create a new task
router.post('/', authenticateJWT, async (req, res) => {
    const { title, completed = false, category_id } = req.body; 
    const user_id = req.user.id; // Extract user ID from the authenticated request

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required.' });
    }
    if (!category_id || typeof category_id !== 'number') {
        return res.status(400).json({ error: 'Category ID is required and must be a number.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, completed, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, title, completed, category_id] // Remove description from parameters
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Get Tasks for authenticated user with pagination
router.get('/', authenticateJWT, async (req, res) => {
    const user_id = req.user.id; // Extract user ID from the authenticated request
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate offset
    const offset = (page - 1) * limit;

    try {
        // Base query
        let query = 'SELECT * FROM tasks WHERE user_id = $1';
        const values = [user_id];

        // Conditional filters
        if (req.query.completed !== undefined) {
            query += ' AND completed = $2';
            values.push(req.query.completed === 'true'); // Convert string to boolean
        }
        
        if (req.query.category_id !== undefined) {
            query += ' AND category_id = $3';
            values.push(parseInt(req.query.category_id, 10)); // Ensure it's an integer
        }

        // Add limit and offset
        query += ' LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limit, offset);

        const result = await pool.query(query, values);
        
        // Get total count of tasks for metadata
        const countResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE user_id = $1', [user_id]);
        const totalTasks = parseInt(countResult.rows[0].count, 10);

        res.status(200).json({
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            tasks: result.rows,
        });
    } catch (err) {
        console.error('Error in GET tasks:', err); // Log error
        res.status(500).json({ error: 'Server error', details: err.message }); // Send error details
    }
});

// Update Task
router.put('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body; // Only need completed for this update

    // Validation
    if (completed === undefined || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean value.' });
    }

    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [completed, id, req.user.id] // Ensure the task belongs to the user
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or you do not have permission to update this task.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Delete Task
router.delete('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        // Checking if task exists
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // If task exists then delete it
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(204).send();   
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
