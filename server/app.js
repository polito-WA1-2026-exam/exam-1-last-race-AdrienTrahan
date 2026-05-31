import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';

import { BaseController } from './controllers/base-controller/index.js';
import { AuthService } from './services/auth-service/index.js';
import { MapService } from './services/map-service/index.js';
import { EventService } from './services/event-service/index.js';

import defaults from './defaults.json' with { type: 'json' };

export class App {
    baseController = new BaseController();
    app = express();

    constructor() {}

    async start(port = 3001) {
        this.authService = await AuthService.create();
        this.mapService = await MapService.create();
        this.eventService = await EventService.create();

        // await this.prefillDefaults(); Only uncomment this to generate default data

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(
            cors({
                origin: 'http://localhost:5173',
                optionsSuccessState: 200,
                credentials: true,
            }),
        );

        this.app.use(
            session({
                secret: 'secret',
                resave: false,
                saveUninitialized: false,
            }),
        );
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        await this.baseController.use(this.app);

        this.app.listen(port, () =>
            console.log(`Server listening at http://localhost:${port}`),
        );
    }

    async prefillDefaults() {
        try {
            await this.mapService.clearMaps();
            for (const map of defaults.maps) {
                await this.mapService.createMap(map.segments, map.stations);
            }
        } catch (err) {}

        try {
            await this.eventService.clearEvents();
            for (const event of defaults.events) {
                await this.eventService.addEvent(event.name, event.effect);
            }
        } catch (err) {}

        try {
            for (const user of defaults.users) {
                await this.authService.registerUser(
                    user.username,
                    user.password,
                );
            }
        } catch (err) {}
    }
}
