import wretch from 'wretch';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getApi } from '../lib/network.js';
import { useAuth } from './auth-provider.jsx';

const GameContext = createContext();

export function GameProvider({ children }) {
    const [game, setGame] = useState();
    const [events, setEvents] = useState([]);

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

    function submit(answer) {
        return submitAnswers(user?.id, game.id, answer).then(
            ({ game, events = [] }) => {
                setGame(game);
                setEvents(events);
                return { game, events };
            },
        );
    }

    return (
        <GameContext.Provider value={{ game, events, create, launch, submit }}>
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

async function submitAnswers(userId, gameId, answer) {
    return getApi()
        .options({ credentials: 'include', mode: 'cors' })
        .post({ gameId, answer }, '/game/answer')
        .json();
}
