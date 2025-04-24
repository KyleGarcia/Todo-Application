// Manages the Task Creation 
import React, { useState } from 'react';

const CreateTask = ({ userId, addTask }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(1); // Default category as a number
    const [description, setDescription] = useState(''); // Description optional
    const [isDaily, setIsDaily] = useState(false);         // Define the isDaily state 
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Success Message State

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title) {
            setError('Task title is required');
            return;
        }
    
        const token = localStorage.getItem('token');
        console.log("Request Body:", { title, category_id: category, completed: false, description }); // Log the body
    
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
                    completed: false,  // Add completed field
                    description, // Include description
                    is_daily: isDaily, // if daily is checked.
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Get the error message from the response
                console.error('Response Error:', errorData); // Log the error details
                throw new Error(errorData.error || 'Failed to add task'); // Use the error message if available
            }
    
            const newTask = await response.json(); // Assuming the new task is returned
            addTask(newTask); // Update the task list
            setSuccessMessage('Task created successfully!'); //Prepare success message.
            setTimeout(() => setSuccessMessage(''), 3000); //Clear after a few seconds.
            setTitle(''); // Clear input
            setCategory(1); // Reset to default category
            setDescription(''); // Clear description field
            setIsDaily(false); // reset
            setError(''); // Reset error
        } catch (error) {
            setError(error.message);
            console.error('Error adding task:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="create-task-form">
                <h3>Title:</h3>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title"
                    required
                />

                {/*Form Category Dropdown*/}
                <h3>Type:</h3>
                <div className="category-row">

                    <select
                        value={category}
                        onChange={(e) => setCategory(Number(e.target.value))}
                    >
                        <option value="1">Work</option>
                        <option value="2">Personal</option>
                        <option value="3">Urgent</option>
                    </select>

                    {/*Form Daily Checkbox*/}
                    <label htmlFor="dailyCheckbox" className="checkbox-label">
                        <input
                            type="checkbox"
                            id="dailyCheckbox"
                            name="dailyCheckbox" 
                            checked={isDaily}
                            onChange={(e) => setIsDaily(e.target.checked)}
                        />
                        Daily?
                    </label>
                </div>
                
                {/*Form Description */}
                <h3>Description:</h3>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description (optional)"
                />
                {successMessage && <div className="success-message">{successMessage}</div>}
                <button type="submit">Add Task</button>
                {error && <div className="text-danger">{error}</div>}
            </form>
        </div>
    );

};

export default CreateTask;
