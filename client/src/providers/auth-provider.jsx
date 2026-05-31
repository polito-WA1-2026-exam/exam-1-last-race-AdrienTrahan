import wretch from 'wretch';
import { createContext, useContext, useState, useEffect } from 'react';

import { getApi } from '../lib/network.js';
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let unmounted = false;
        setLoading(true);
        getLoginStatus()
            .then((user) => {
                if (unmounted) return;
                setLoading(false);
                if (user) setUser(user);
            })
            .catch(() => {
                if (unmounted) return;
                setLoading(false);
                setUser(null);
            });

        return () => {
            unmounted = true;
        };
    }, []);

    async function login(username, password) {
        const user = await logInUser(username, password);
        setUser(user);
        return user;
    }

    async function register(username, password) {
        await registerUser(username, password);
        return login(username, password);
    }

    async function logout() {
        await logoutUser();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

async function getLoginStatus() {
    return new Promise((resolve, reject) =>
        getApi()
            .options({ credentials: 'include', mode: 'cors' })
            .get('/auth')
            .json()
            .then(resolve)
            .catch(() => resolve(null)),
    );
}

async function logInUser(username, password) {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .post(
            {
                username,
                password,
            },
            '/auth/login/user',
        )
        .json();
}

async function registerUser(username, password) {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .post(
            {
                username,
                password,
            },
            '/auth/register/user',
        )
        .json();
}

async function logoutUser() {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .delete('/auth');
}
