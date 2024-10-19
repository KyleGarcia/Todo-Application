// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Registration from './Registration';
import Tasks from './Tasks';
import CreateTask from './CreateTask'; // Import CreateTask
import { MDBContainer } from 'mdb-react-ui-kit'; // Adjust if needed for your styling

// Home Component
const Home = () => <div>Welcome to the Todo App!</div>;

const Login = ({ setIsAuthenticated }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: identifier, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                navigate('/tasks');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (error) {
            setError('Error during login');
            console.error('Error during login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MDBContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="p-3 w-50">
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email or Username"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    {error && <div className="text-danger">{error}</div>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <div>
                    <p>Not a member? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </MDBContainer>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    return (
       
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
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/tasks" element={<Tasks />} />
                </Routes>
            </div>
        
    );
}

export default App;
