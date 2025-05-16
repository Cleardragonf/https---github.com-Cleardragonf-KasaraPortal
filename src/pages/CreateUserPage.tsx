import React, { useState, useEffect } from 'react';
const backendUrl = process.env.REACT_APP_PROXY; // Get the backend URL from environment variables


const CreateUserPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User'); // Default role
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Automatically generate the username based on firstName and lastName
    useEffect(() => {
        const generateUsername = async () => {
            if (firstName && lastName) {
                let baseUsername = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}`;
                let newUsername = baseUsername;
                let counter = 1;

                // Check if the username already exists
                while (await isUsernameTaken(newUsername)) {
                    newUsername = `${baseUsername}${counter}`;
                    counter++;
                }

                setUsername(newUsername);
            } else {
                setUsername('');
            }
        };

        generateUsername();
    }, [firstName, lastName]);

    const isUsernameTaken = async (usernameToCheck: string): Promise<boolean> => {
        try {
            const response = await fetch(`${backendUrl}/api/auth/check-username?username=${encodeURIComponent(usernameToCheck)}`);
            const data = await response.json();
            return data.exists; // Assume the API returns { exists: true/false }
        } catch (error) {
            console.error('Error checking username:', error);
            return false; // Default to false if there's an error
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password || !email || !firstName || !lastName || !role) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, status: 'pending', FirstName: firstName, LastName: lastName, Role: role }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('User created successfully. Awaiting approval.');
                setError('');
            } else {
                setError(data.message || 'Failed to create user.');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error during user creation:', error);
            setError('An error occurred. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="create-user-container">
            <h1>Create User</h1>
            <form onSubmit={handleCreateUser}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Owner">Owner</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        readOnly // Make the username field read-only
                        placeholder="Generated username"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit" className="create-user-button">Create User</button>
            </form>
        </div>
    );
};

export default CreateUserPage;
