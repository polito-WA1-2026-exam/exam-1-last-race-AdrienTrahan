import crypto from 'crypto';
import { promisify } from 'util';

import { DBService } from '../db-service/index.js';

export class GameService {
    async start() {
        this.dbService = await DBService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NULL,
                    score INTEGER DEFAULT 20,
                    creation_date TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `,
        );
    }

    async createGame() {
        return await this.dbService.get(
            'INSERT INTO games (user_id) VALUES (NULL) RETURNING id, score',
        );
    }

    async setGameOwnerShip(gameId, userId) {
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
