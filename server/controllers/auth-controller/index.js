import express from 'express';
import passport from 'passport';

import { AuthService } from '../../services/auth-service/index.js';
import { AuthenticationInvalid } from '../../error.js';
import { validateBody } from '../validator.js';
import { registerUserSchema, loginUserSchema } from './schema.js';

export class AuthController {
    router = express.Router({ mergeParams: true });

    authService;

    async use(app) {
        this.authService = await AuthService.create();

        this.router.get('/', (req, res) => res.send('Hello from API'));
        this.router.post(
            '/register/user',
            validateBody(registerUserSchema),
            async (req, res) => {
                const { username, password } = req.body;
                const user = await this.authService.registerUser(
                    username,
                    password,
                );
                res.json({ ...user });
            },
        );
        this.router.post(
            '/login/user',
            validateBody(loginUserSchema),
            (req, res, next) => {
                passport.authenticate('local', (err, user) => {
                    if (err) return next(err);
                    if (!user) throw new AuthenticationInvalid();
                    req.login(user, (err) => {
                        if (err) return next(err);
                        res.json({ ...user });
                    });
                })(req, res, next);
            },
        );

        this.router.post('/login/anonymous', async (req, res, next) => {
            const user = await this.authService.loginAnonymous();
            req.login(user, (err) => {
                if (err) return next(err);
                res.json({ ...user });
            });
        });

        this.router.get('/current', async (req, res, next) => {
            if (req.isAuthenticated()) res.json(req.user);
            else throw new AuthenticationInvalid();
        });

        this.router.delete('/current', (req, res) =>
            req.logout(() => res.end()),
        );

        await app.use('/auth', this.router);
    }
}
