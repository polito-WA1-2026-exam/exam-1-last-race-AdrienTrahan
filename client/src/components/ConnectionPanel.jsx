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
        <form className="border-2 border-black bg-white px-6 py-6">
            <h2 className="mb-5 text-base font-bold text-black">
                Sign in
            </h2>
            {error && (
                <div
                    role="alert"
                    className="mb-4 border-2 border-black bg-red-100 px-3 py-2 text-sm font-bold text-black"
                >
                    {error}
                </div>
            )}
            <div className="mb-4">
                <label
                    htmlFor="username"
                    className="mb-1 block text-xs font-bold text-black"
                >
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black placeholder-gray-400 outline-none transition focus:border-emerald-500"
                />
            </div>
            <div className="mb-5">
                <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-bold text-black"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black placeholder-gray-400 outline-none transition focus:border-emerald-500"
                />
            </div>
            <button
                type="submit"
                onClick={handleLogin}
                disabled={!username || !password}
                className="w-full cursor-pointer border-2 border-black bg-emerald-400 px-4 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
                Login
            </button>
            <button
                type="button"
                onClick={handleRegister}
                disabled={!username || !password}
                className="mt-2 w-full cursor-pointer border-2 border-black bg-white px-4 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
                Register
            </button>
        </form>
    );
}
