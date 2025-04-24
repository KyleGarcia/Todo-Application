const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const authenticateJWT = require('./middlewares/authMiddleware');

// Create a new task
router.post('/', authenticateJWT, async (req, res) => {
    const { title, completed = false, category_id, description, is_daily } = req.body; 
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
            'INSERT INTO tasks (user_id, title, completed, category_id, description, is_daily) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, title, completed, category_id, description, is_daily]       
        );
        console.log('Creating task with body: ', req.body);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});


// Get Tasks for authenticated user with pagination
router.get('/', authenticateJWT, async (req, res) => {
    const user_id = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, title, completed, category_id, description, is_daily, created_at FROM tasks WHERE user_id = $1';
    const values = [user_id];
    let paramIndex = 2;

    if (req.query.completed === 'true' || req.query.completed === 'false') {
        query += ` AND completed = $${paramIndex}`;
        values.push(req.query.completed === 'true');
        paramIndex++;
    }

    if (req.query.category_id && !isNaN(parseInt(req.query.category_id))) {
        query += ` AND category_id = $${paramIndex}`;
        values.push(parseInt(req.query.category_id));
        paramIndex++;
    }

    if (req.query.is_daily === 'true' || req.query.is_daily === 'false') {
        query += ` AND is_daily = $${paramIndex}`;
        values.push(req.query.is_daily === 'true');
        paramIndex++;
    }

    // Add LIMIT and OFFSET at the end
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
        const result = await pool.query(query, values);

        const countResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE user_id = $1', [user_id]);
        const totalTasks = parseInt(countResult.rows[0].count, 10);

        res.status(200).json({
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            tasks: result.rows,
        });
    } catch (err) {
        console.error('Error in GET tasks:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
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
