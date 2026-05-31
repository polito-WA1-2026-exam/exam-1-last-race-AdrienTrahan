import { useState } from 'react';
import { useAuth } from '../providers/auth-provider.jsx';

export function ConnectionPanel() {
    const { login, register } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(event) {
        event.preventDefault();
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError(err?.message || 'Login failed');
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        setError('');
        try {
            await register(username, password);
        } catch (err) {
            setError(err?.message || 'Registration failed');
        }
    }

    return (
        <form>
            <h2>Login</h2>
            {error && <div role="alert">{error}</div>}
            <div>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" onClick={handleLogin}>
                Login
            </button>
            <button type="button" onClick={handleRegister}>
                Register
            </button>
        </form>
    );
}
