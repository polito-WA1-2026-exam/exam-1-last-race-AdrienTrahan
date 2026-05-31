import wretch from 'wretch';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../lib/network.js';
const GameContext = createContext();

export function GameProvider({ children }) {
    const [game, setGame] = useState();
    const navigate = useNavigate();

    function create() {
        return createGame().then((game) => {
            setGame(game);
        });
    }

    return (
        <GameContext.Provider value={{ game, create }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}

async function createGame() {
    return getApi().post({}, '/game').json();
}

async function launchGame() {}
