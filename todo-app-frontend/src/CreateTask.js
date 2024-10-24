// Manages the Task Creation 
import React, { useState } from 'react';

const CreateTask = ({ userId, addTask }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(1); // Default category as a number
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title) {
            setError('Task title is required');
            return;
        }
    
        const token = localStorage.getItem('token');
        console.log("Request Body:", { title, category_id: category, completed: false }); // Log the body
    
        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    title, 
                    category_id: category, // Ensure this is a number
                    completed: false  // Add completed field
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Get the error message from the response
                console.error('Response Error:', errorData); // Log the error details
                throw new Error(errorData.error || 'Failed to add task'); // Use the error message if available
            }
    
            const newTask = await response.json(); // Assuming the new task is returned
            addTask(newTask); // Update the task list
            setTitle(''); // Clear input
            setCategory(1); // Reset to default category
            setError(''); // Reset error
        } catch (error) {
            setError(error.message);
            console.error('Error adding task:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                required
            />
            <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))} // Convert to number
            >
                <option value="1">Work</option>
                <option value="2">Personal</option>
                <option value="3">Urgent</option>
            </select>
            <button type="submit">Add Task</button>
            {error && <div className="text-danger">{error}</div>}
        </form>
    );
};

export default CreateTask;
