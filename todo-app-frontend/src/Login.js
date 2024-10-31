import React, { useState } from 'react';
import { MDBContainer } from 'mdb-react-ui-kit';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated, setUsername }) => {
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
                console.log('Login response data:', data);//debugging
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username); //store username for profile login
                setUsername(data.username);
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
                    <p>Forgot Password? <Link to="/password">Recover Password</Link></p>
                </div>
            </div>
        </MDBContainer>
    );
};

export default Login;