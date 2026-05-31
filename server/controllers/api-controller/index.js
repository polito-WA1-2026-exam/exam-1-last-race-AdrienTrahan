import express from 'express';

import { AuthController } from '../auth-controller/index.js';
import { GameController } from '../game-controller/index.js';
export class ApiController {
    router = express.Router({ mergeParams: true });
    authController = new AuthController();
    gameController = new GameController();
    async use(app) {
        this.router.use(express.json());
        this.router.use(express.urlencoded({ extended: true }));

        await this.authController.use(this.router);
        await this.gameController.use(this.router);

        await app.use('/api', this.router);
    }
}
