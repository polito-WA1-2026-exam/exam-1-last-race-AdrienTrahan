import crypto from 'crypto';
import { promisify } from 'util';

import { DBService } from '../db-service/index.js';
import { MapService } from '../map-service/index.js';
export class GameService {
    mapService;

    async start() {
        this.dbService = await DBService.create();
        this.mapService = await MapService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NULL,
                    score INTEGER DEFAULT 20,
                    creation_date TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `,
        );
    }

    async createGame() {
        const { id, score } = await this.dbService.get(
            'INSERT INTO games (user_id) VALUES (NULL) RETURNING id, score',
        );

        const map = await this.mapService.getMap();
        return { id, score, map };
    }

    async launchGame(gameId, userId) {
        return await this.dbService.run(
            'UPDATE games SET user_id = ? WHERE id = ?',
            [userId, gameId],
        );
    }

    static instance = null;
    static async create(...args) {
        if (!GameService.instance) {
            GameService.instance = new GameService();
            await GameService.instance.start(...args);
        }
        return GameService.instance;
    }
}
