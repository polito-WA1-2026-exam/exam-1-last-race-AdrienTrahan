import express from 'express';
import passport from 'passport';

import { AuthenticationInvalid } from '../../error.js';
import { GameService } from '../../services/game-service/index.js';
import { validateBody } from '../validator.js';
import { gameLaunchSchema, gameSubmitAnswerSchema } from './schema.js';

export class GameController {
    router = express.Router({ mergeParams: true });

    gameService;

    async use(app) {
        this.gameService = await GameService.create();
        this.router.post('/', async (req, res) => {
            const game = await this.gameService.createGame();
            res.json({ ...game });
        });
        this.router.post(
            '/launch',
            validateBody(gameLaunchSchema),
            async (req, res, next) => {
                const gameId = req.body.gameId;
                if (!req.isAuthenticated()) throw new AuthenticationInvalid();
                const game = await this.gameService.launchGame(
                    gameId,
                    req.user.id,
                );
                res.json({ ...game });
            },
        );
        this.router.post(
            '/answer',
            validateBody(gameSubmitAnswerSchema),
            async (req, res, next) => {
                const gameId = req.body.gameId;
                const answer = req.body.answer;
                const user = req.isAuthenticated();
                if (!user) throw new AuthenticationInvalid();
                const { game, events } = await this.gameService.submitAnswer(
                    gameId,
                    answer,
                );
                res.json({ game, events });
            },
        );

        this.router.get('/', async (req, res) => {
            const user = req.isAuthenticated();
            if (!user) throw new AuthenticationInvalid();
            const games = await this.gameService.getFinishedGames(req.user.id);
            res.json({ games });
        });

        await app.use('/game', this.router);
    }
}
