import React, { useEffect, useState } from 'react';
import CreateTask from './CreateTask';

const Tasks = ({ userId, username, handleLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalTasks, setTotalTasks] = useState(0); // To store the total count of tasks
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTask, setEditTask] = useState({ title: '', category_id: 1, description: '', id: null });

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/tasks?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    const errorData = await response.json();
                    if (errorData.error === 'Token expired or invalid') {
                        handleLogout(); // Call logout function on token expiration
                        setError('Your session has expired. Please log in again to continue.');
                        return; // Exit early
                    }
                }
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data.tasks);
            setTotalTasks(data.totalTasks); // Set total task count for pagination
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [page]); // Fetch tasks whenever the page changes

    const markAsCompleted = async (taskId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: true }),
            });
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            
            // Update the local tasks state without refetching
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, completed: true } : task
                )
            );
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

    const handleEditClick = (task) => {
        setIsEditing(true);
        setEditTask({ ...task });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${editTask.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editTask),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Update the task in the local state
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === editTask.id ? editTask : task))
            );

            setIsEditing(false);
            setEditTask({ title: '', category_id: 1, description: '', id: null }); // Reset the edit form
        } catch (err) {
            setError(err.message);
            console.error('Error updating task:', err);
        }
    };

    const getCategoryname = (category_id) => {
        switch (category_id) {
            case 1:
                return 'Work';
            case 2:
                return 'Personal';
            case 3:
                return 'Urgent';
            default:
                return 'Unknown';
        }
    };

    // Group tasks by completion status
    const groupedTasks = {
        completed: tasks.filter(task => task.completed),
        incomplete: tasks.filter(task => !task.completed),
    };

    const totalPages = Math.ceil(totalTasks / limit);

    return (
        <div>
            <h2>{username}'s Tasks</h2>
            {error && <div className="text-danger">{error}</div>}
            <CreateTask userId={userId} addTask={(newTask) => setTasks((prevTasks) => [...prevTasks, newTask])} />
    
            <div>
                <h3>Incomplete Tasks</h3>
                {groupedTasks.incomplete.map((task) => (
                    <div className="task" key={task.id}>
                        <div className="task-header">
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                {task.title}
                            </span>
                            <div>
                                <button onClick={() => markAsCompleted(task.id)} disabled={task.completed}>
                                    {task.completed ? 'Completed' : 'Mark as Completed'}
                                </button>
                                <button onClick={() => handleEditClick(task)}>Edit</button>
                                <button onClick={() => deleteTask(task.id)}>Delete</button>
                            </div>
                        </div>
                        <div className="task-details">
                            <h5>Category: {getCategoryname(task.category_id)} </h5>
                            <h5>Created At: {new Date(task.created_at).toLocaleString()}</h5>
                            <h6>Description: {task.description || 'No description provided.'}</h6>
                        </div>
                    </div>
                ))}
            </div>
    
            <div>
                <h3>Completed Tasks</h3>
                {groupedTasks.completed.map((task) => (
                    <div className="task" key={task.id}>
                        <div className="task-header">
                            <span style={{ textDecoration: 'line-through' }}>
                                {task.title}
                            </span>
                            <div>
                                <button onClick={() => markAsCompleted(task.id)} disabled>
                                    Completed
                                </button>
                                <button onClick={() => deleteTask(task.id)}>Delete</button>
                            </div>
                        </div>
                        <div className="task-details">
                            <h5>Category: {getCategoryname(task.category_id)} </h5>
                            <h5>Created At: {new Date(task.created_at).toLocaleString()}</h5>
                            <h6>Description: {task.description || 'No description provided.'}</h6>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Editing */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Task</h3>
                        <form onSubmit={handleEditSubmit}>
                            <input
                                type="text"
                                value={editTask.title}
                                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                                placeholder="Task Title"
                                required
                            />
                            <select
                                value={editTask.category_id}
                                onChange={(e) => setEditTask({ ...editTask, category_id: Number(e.target.value) })}
                            >
                                <option value="1">Work</option>
                                <option value="2">Personal</option>
                                <option value="3">Urgent</option>
                            </select>
                            <textarea
                                value={editTask.description}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                placeholder="Enter task description (optional)"
                            />
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            <div>
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                </button>
                <span> Page {page} of {totalPages} </span>
                <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                    Next
                </button>
            </div>
    
            <h3>End of Task List</h3>
        </div>
    );
};

export default Tasks;
