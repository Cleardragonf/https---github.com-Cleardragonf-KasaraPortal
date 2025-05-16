import React, { useState } from 'react';
import './LoginPage.css'; // Import styles for the login page
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import Material UI icons
import AnimatedBackground from '../components/AnimatedBackground';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const backendUrl = process.env.REACT_APP_PROXY;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/auth/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                login(data.user.username); // Pass the username to the login method
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <AnimatedBackground />
            <div className="login-container">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                            <span
                                className="toggle-password-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </span>
                        </div>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p>
                    Don't have an account? <Link to="/create-user">Create one here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
