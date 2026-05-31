import express from 'express';
import { ApiController } from '../api-controller/index.js';
import { AuthController } from '../auth-controller/index.js';
import { AppError, InternalServerError } from '../../error.js';

export class BaseController {
    router = express.Router({ mergeParams: true });

    apiController = new ApiController();

    async use(app) {
        this.router.use(express.json());
        this.router.use(express.urlencoded({ extended: true }));

        await this.apiController.use(this.router);

        this.router.use((err, _req, res, _next) => {
            console.log(err);
            const appError =
                err instanceof AppError ? err : new InternalServerError();
            const response = {
                error: appError.message,
                code: appError.errorCode,
            };
            return res.status(appError.statusCode).json(response);
        });
        await app.use('/', this.router);
    }
}
