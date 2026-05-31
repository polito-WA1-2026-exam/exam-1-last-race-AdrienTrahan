import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes } from 'react-router';
import { Router } from './Router.jsx';
import { AuthProvider } from './providers/auth-provider.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Router />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
);
