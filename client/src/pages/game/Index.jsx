import { Outlet } from 'react-router';
import { GameProvider } from '../../providers/game-provider.jsx';
export function Game() {
    return (
        <>
            <GameProvider>
                <Outlet />
            </GameProvider>
        </>
    );
}
