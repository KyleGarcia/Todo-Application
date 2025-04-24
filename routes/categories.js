const express = require('express');
const router = express.Router();
const pool = require('../db/db')

// POST a new category
router.post('/', async (req, res) => {
    //retrieve categories
    const { name } = req.body;
    try {
        // Check if category already exists
        const existingCategory = await pool.query('SELECT * FROM categories WHERE name = $1', [name]);
        if (existingCategory.rowCount > 0) {
            return res.status(409).json({ error: 'Category already exists' });
        }

        //inserting a new category
        const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a category
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json( {error: 'Server error' });
    }
});

// PUT to update category
router.put('/:id', async (req, res) => {
    //update specific category
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Category not found' });

        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error'});
    }
});
// DELETE a category
router.delete('/:id', async (req, res) => {
    // deleting a specific category
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).send(); // no content to send back
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;