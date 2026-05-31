import express from 'express';

import { AuthenticationInvalid } from '../../error.js';
import { GameService } from '../../services/game-service/index.js';
import { validateBody } from '../validator.js';

export class GameController {
    router = express.Router({ mergeParams: true });

    gameService;

    async use(app) {
        this.gameService = await GameService.create();
        this.router.post('/', async (req, res) => {
            const game = await this.gameService.createGame();
            res.json({ ...game });
        });

        await app.use('/game', this.router);
    }
}
