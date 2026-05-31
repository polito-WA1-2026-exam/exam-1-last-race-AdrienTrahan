import wretch from 'wretch';
import { createContext, useContext, useState, useEffect } from 'react';

import { getApi } from '../lib/network.js';
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let unmounted = false;
        getLoginStatus().then((user) => {
            if (unmounted) return;
            if (user) {
                setUser(user);
            } else
                logInAnonymous().then((user) => {
                    if (unmounted) return;
                    setUser(user);
                });
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
        const user = await logInAnonymous();
        setUser(user);
        return user;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {error && <div>Error</div>}
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
            .get('/auth/current')
            .json()
            .then(resolve)
            .catch(() => resolve(null)),
    );
}

async function logInAnonymous() {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .post({}, '/auth/login/anonymous')
        .json();
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
        .delete('/auth/current');
}
