import { Routes, Route } from 'react-router';
import { App } from './pages/App.jsx';
export function Router() {
    return (
        <Routes>
            <Route path="/" element={<App />}></Route>
        </Routes>
    );
}
