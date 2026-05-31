import express from 'express';
import { AuthController } from '../auth-controller/index.js';
export class ApiController {
    router = express.Router({ mergeParams: true });
    authController = new AuthController();
    async use(app) {
        this.router.use(express.json());
        this.router.use(express.urlencoded({ extended: true }));

        await this.authController.use(this.router);
        await app.use('/api', this.router);
    }
}
