import wretch from 'wretch';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../lib/network.js';
import { useAuth } from './auth-provider.jsx';

const GameContext = createContext();

export function GameProvider({ children }) {
    const [game, setGame] = useState();
    const { user } = useAuth();
    const navigate = useNavigate();

    function create() {
        return createGame().then((game) => {
            setGame(game);
        });
    }

    function launch() {
        return launchGame(user?.id, game.id).then((game) => {
            setGame(game);
        });
    }

    return (
        <GameContext.Provider value={{ game, create, launch }}>
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

async function launchGame(userId, gameId) {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .post({ gameId }, '/game/launch')
        .json();
}
