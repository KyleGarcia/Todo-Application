import { MDBContainer } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); //adding email requirement
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegistration = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!username || !password || !email) {
            setError('Username, password and email are required');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data);
                navigate('/login');
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
        <MDBContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="p-3 w-50">

            <h4>Register for a new account today!</h4> 
            
                <form onSubmit={handleRegistration} >
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        
                    />
                    <input
                        type="email"
                        value={email}//bind email state
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
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
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
            </div>
        </MDBContainer>
    );
};
export default Registration;
