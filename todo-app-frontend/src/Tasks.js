import React, { useEffect, useState } from 'react';
import CreateTask from './CreateTask'; // Ensure this import is present

const Tasks = ({ userId }) => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            setTasks(data.tasks);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        }
    };

    const markAsCompleted = async (taskId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: true }), // Send completed status
            });
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            fetchTasks(); // Refresh task list
        } catch (err) {
            setError(err.message);
            console.error('Error marking task as completed:', err);
        }
    };
    

    const deleteTask = async (taskId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            fetchTasks(); // Refresh task list
        } catch (err) {
            setError(err.message);
            console.error('Error deleting task:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div>
            <h2>Your Tasks</h2>
            {error && <div className="text-danger">{error}</div>}
            <CreateTask userId={userId} addTask={(newTask) => setTasks((prevTasks) => [...prevTasks, newTask])} />
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                            {task.title}
                        </span>
                        <button onClick={() => markAsCompleted(task.id)} disabled={task.completed}>
                            {task.completed ? 'Completed' : 'Mark as Completed'}
                        </button>
                        <button onClick={() => deleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default Tasks;