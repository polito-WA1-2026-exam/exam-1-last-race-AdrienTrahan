import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../../../lib/network.js';
import { useGame } from '../../../providers/game-provider.jsx';
import { useAuth } from '../../../providers/auth-provider.jsx';
import { ConnectionPanel } from '../../../components/ConnectionPanel.jsx';
import { InstructionPanel } from '../../../components/InstructionPanel.jsx';
import { NetworkMap } from '../../../components/NetworkMap.jsx';

export function Setup() {
    const { game, create } = useGame();
    const { user, loading, logout } = useAuth();

    const [loginPanelShowed, setLoginPanelShowed] = useState(false);
    const [instructionPanelShowed, setInstructionPanelShowed] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        console.log(game);
    }, [game]);
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
                <div className="w-full flex gap-2 justify-between border-b-2 py-2 px-2 relative">
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 border-2 cursor-pointer bg-blue-400 hover:bg-blue-500 active:bg-blue-700 font-bold box-border"
                        >
                            Home
                        </button>
                        <button
                            onClick={() =>
                                setInstructionPanelShowed(
                                    (instructionPanelShowed) =>
                                        !instructionPanelShowed,
                                )
                            }
                            className={
                                'px-4 py-2 border-2 cursor-pointer font-bold box-border z-20 ' +
                                (instructionPanelShowed
                                    ? 'bg-red-400 hover:bg-red-500 active:bg-red-700'
                                    : 'bg-lime-400 hover:bg-lime-500 active:bg-lime-700')
                            }
                        >
                            {instructionPanelShowed
                                ? 'Close Instructions'
                                : 'View Instructions'}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {!user && !loading && (
                            <button
                                onClick={() => setLoginPanelShowed(true)}
                                className="px-4 py-2 border-2 disabled:text-zinc-200 disabled:cursor-not-allowed disabled:bg-emerald-100 not-disabled:cursor-pointer not-disabled:bg-emerald-400 not-disabled:hover:bg-emerald-500 not-disabled:emerald:bg-amber-700  font-bold box-border"
                                disabled={loginPanelShowed}
                            >
                                Login
                            </button>
                        )}
                        {user && !loading && (
                            <button
                                onClick={logout}
                                className="px-4 py-2 border-2 cursor-pointer bg-rose-400 font-bold box-border"
                            >
                                Logout
                            </button>
                        )}
                        {game && !loading && (
                            <button
                                className="px-4 py-2 border-2 disabled:text-zinc-200 disabled:cursor-not-allowed disabled:bg-amber-100 not-disabled:cursor-pointer not-disabled:bg-amber-400 not-disabled:hover:bg-amber-500 not-disabled:active:bg-amber-700 font-bold box-border"
                                disabled={!user}
                            >
                                Launch Game
                            </button>
                        )}
                    </div>
                    {instructionPanelShowed && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setInstructionPanelShowed(false)}
                            />
                            <div className="absolute top-14 left-2 z-20 w-lg max-w-[80%] h-screen pb-20">
                                <InstructionPanel />
                            </div>
                        </>
                    )}
                    {loginPanelShowed && !user && !loading && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setLoginPanelShowed(false)}
                            />
                            <div className="absolute top-14 right-2 z-50 w-lg max-w-[80%]">
                                <ConnectionPanel />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex-1 min-h-0 w-full p-2 bg-zinc-500">
                    <NetworkMap
                        stations={game?.map?.stations ?? []}
                        segments={game?.map?.segments ?? []}
                    />
                </div>
            </div>
        </>
    );
}
