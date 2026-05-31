import { Link } from 'react-router';
import { ConnectionPanel } from '../components/ConnectionPanel.jsx';
import { useAuth } from '../providers/auth-provider.jsx';

export function App() {
    const { user, loading, logout } = useAuth();
    return (
        <div className="flex flex-col inset-0 fixed">
            <div className="w-full flex gap-2 justify-end border-b-2 py-2 px-2">
                {!loading && user && (
                    <button
                        onClick={logout}
                        className="px-4 py-2 border-2 cursor-pointer bg-rose-400 font-bold box-border"
                    >
                        Logout
                    </button>
                )}
                <Link to="/game/setup">
                    <button className="px-4 py-2 border-2 cursor-pointer bg-amber-400 font-bold box-border">
                        New Game
                    </button>
                </Link>
            </div>
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                {!loading && !user && (
                    <div className="w-lg max-w-[80%]">
                        <ConnectionPanel />
                    </div>
                )}
            </div>
        </div>
    );
}
