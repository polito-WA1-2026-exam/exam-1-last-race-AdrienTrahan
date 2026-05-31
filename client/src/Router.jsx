import { Routes, Route, Navigate } from 'react-router';
import { App } from './pages/App.jsx';
import { Game } from './pages/game/Index.jsx';
import { Setup } from './pages/game/setup/Index.jsx';
import { Planning } from './pages/game/planning/Index.jsx';
import { Execution } from './pages/game/execution/Index.jsx';
import { Results } from './pages/game/results/Index.jsx';

export function Router() {
    return (
        <Routes>
            <Route path="/" element={<App />}></Route>
            <Route path="game" element={<Game />}>
                <Route index element={<Navigate to="setup" replace />} />
                <Route path="setup" element={<Setup />} />
                <Route path="planning" element={<Planning />} />
                <Route path="execution" element={<Execution />} />
                <Route path="results" element={<Results />} />
            </Route>
        </Routes>
    );
}
