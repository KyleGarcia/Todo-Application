import React, { useState } from 'react';
import { MDBContainer, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegistration = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Client-side validation
        if (!username || !password) {
            setError('Username and password are required');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Optionally handle successful registration (e.g., redirect to login)
                console.log('Registration successful:', data);
                navigate('/login'); // Redirect to login page after successful registration
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Registration failed');
            }
        } catch (error) {
            setError('Error during registration');
            console.error('Error during registration:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MDBContainer>
            <form onSubmit={handleRegistration}>
                <MDBInput
                    label='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <MDBInput
                    label='Password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <div className="text-danger">{error}</div>}
                <MDBBtn type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </MDBBtn>
            </form>
        </MDBContainer>
    );
};

export default Registration;
