import { Link } from 'react-router';
import { useEffect, useState } from 'react';

import { getApi } from '../lib/network.js';
import { ConnectionPanel } from '../components/ConnectionPanel.jsx';
import { useAuth } from '../providers/auth-provider.jsx';

export function App() {
    const { user, loading, logout } = useAuth();
    const [games, setGames] = useState([]);
    useEffect(() => {
        let unmounted = false;
        if (!user) return;
        getGames(user.id).then(({ games }) => {
            if (unmounted) return;
            setGames(games);
        });
        return () => {
            unmounted = true;
        };
    }, [user]);
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
            {!loading && !user && (
                <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <div className="w-lg max-w-[80%]">
                        <ConnectionPanel />
                    </div>
                </div>
            )}

            {!loading && user && (
                <div className="flex-1 min-h-0 w-full flex items-center flex-col overflow-auto pb-4">
                    <h1 className="text-3xl font-bold w-full max-w-lg mx-auto mt-12">
                        Scoreboard
                    </h1>
                    <div className=" w-full max-w-lg">
                        {games
                            .sort((a, b) => b.score - a.score)
                            .map((game) => (
                                <div
                                    className="w-full border-2 mt-2 py-2 px-2 flex justify-between"
                                    key={'game' + game?.id}
                                >
                                    <h1>
                                        {game?.creationDate}
                                        {game?.wasSolved
                                            ? ' (Solved)'
                                            : ' (Not Solved)'}
                                    </h1>
                                    <p>{game?.score}</p>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

async function getGames(userId) {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .get('/game')
        .json();
}
