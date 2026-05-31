import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';

import { useGame } from '../../../providers/game-provider.jsx';

export function Results() {
    const { game } = useGame();

    return (
        <div className="flex flex-col items-center gap-2 inset-0 fixed justify-center">
            <h1 className="text-4xl font-bold mb-8">Game Ended</h1>
            {!!game?.wasSolved && (
                <>
                    <h2 className="text-lg">
                        The answer you submitted was CORRECT!
                    </h2>
                    <h3 className="text-sm">Score: {game.score}</h3>
                </>
            )}
            {!game?.wasSolved && (
                <>
                    <h2 className="text-lg">
                        The path you submitted was invalid...
                    </h2>
                </>
            )}
            <div className="flex gap-2 mt-14 mb-14">
                <Link to="/game/setup">
                    <button className="px-4 py-2 border-2 bg-blue-400 hover:bg-blue-500 active:bg-blue-700  cursor-pointer font-bold box-border">
                        Home
                    </button>
                </Link>

                <Link to="/game/setup">
                    <button className="px-4 py-2 border-2 cursor-pointer bg-amber-400 hover:bg-amber-500 active:bg-amber-700 font-bold box-border">
                        New Game
                    </button>
                </Link>
            </div>
        </div>
    );
}
