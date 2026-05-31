import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../../../lib/network.js';
import { useGame } from '../../../providers/game-provider.jsx';
import { useAuth } from '../../../providers/auth-provider.jsx';
import { ConnectionPanel } from '../../../components/ConnectionPanel.jsx';

export function Setup() {
    const { game, create } = useGame();
    const { user, loading, logout } = useAuth();

    const [loginPanelShowed, setLoginPanelShowed] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let unmounted = false;
        create().catch(() => {
            if (unmounted) return;
            navigate('/');
        });
        return () => {
            unmounted = true;
        };
    }, []);
    return (
        <>
            <div className="flex flex-col inset-0 fixed">
                <div className="w-full flex gap-2 justify-end border-b-2 py-2 px-2 relative">
                    {!user && !loading && (
                        <button
                            onClick={() => setLoginPanelShowed(true)}
                            className="px-4 py-2 border-2 disabled:text-zinc-200 disabled:cursor-not-allowed disabled:bg-emerald-100 not-disabled:cursor-pointer not-disabled:hover:bg-emerald-500 not-disabled:bg-emerald-400 not-disabled:active:bg-emerald-700 font-bold box-border transition"
                            disabled={loginPanelShowed}
                        >
                            Login
                        </button>
                    )}
                    {user && !loading && (
                        <button
                            onClick={logout}
                            className="px-4 py-2 border-2 cursor-pointer hover:bg-rose-500 bg-rose-400 active:bg-rose-700 font-bold box-border transition"
                        >
                            Logout
                        </button>
                    )}
                    {game && !loading && (
                        <button
                            className="px-4 py-2 border-2 disabled:text-zinc-200 disabled:cursor-not-allowed disabled:bg-amber-100 not-disabled:cursor-pointer not-disabled:hover:bg-amber-500 not-disabled:bg-amber-400 active:bg-amber-700 font-bold box-border transition"
                            disabled={!user}
                        >
                            Launch Game
                        </button>
                    )}
                    {loginPanelShowed && !user && !loading && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setLoginPanelShowed(false)}
                            />
                            <div className="absolute top-14 right-2 z-20 w-lg max-w-[80%]">
                                <ConnectionPanel />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex-1 min-h-0 w-full"></div>
            </div>
        </>
    );
}
