import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../API/Auth';
import '../styles/Login.css';
import logo from '../RCBadge.png';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await login(username, password);
            navigate('/'); 
        } catch (err) {
            setError('Login failed. ' + err.message); 
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="image-container">
                    <img src={logo} alt="RC Badge" />
                </div>
                <h2>School Placements</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Submit</button>
            </form>
        </div>
    );
}

export default Login;
