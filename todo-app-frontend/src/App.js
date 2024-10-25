// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Registration from './Registration';
import Tasks from './Tasks';
import Login from './Login';


// Home Component
const Home = () => <div>Welcome to the Todo Application!</div>;


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username'); 
        setIsAuthenticated(!!token);
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);
    console.log('Username:', username);
    return (
        <div className="code-wrapper">
            <div>
                <h1>My Todo App</h1>
                <nav>
                    <Link to="/">Home</Link> | 
                    {isAuthenticated ? (
                        <>
                            <Link to="/tasks">Tasks</Link> | 
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link> | 
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
                
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/tasks" element={<Tasks username={username} handleLogout={handleLogout} />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
