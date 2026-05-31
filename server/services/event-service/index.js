import crypto from 'crypto';

import { DBService } from '../db-service/index.js';
import { randomInt } from '../../utils/random.js';

export class EventService {
    async start() {
        this.dbService = await DBService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT NOT NULL,
                    effect INTEGER NOT NULL
                );
            `,
        );
    }

    async addEvent(description, effect) {
        const { lastID } = await this.dbService.run(
            'INSERT INTO events (description, effect) VALUES (?, ?) RETURNING id',
            [description, effect],
        );
        return lastID;
    }

    async sampleEvents(n) {
        const events = await this.getEvents();
        return Array(n)
            .fill(0)
            .map(() => events[randomInt(0, events.length)]);
    }

    async getEvents() {
        return this.dbService.all('SELECT * FROM events');
    }

    async clearEvents() {
        await this.dbService.run('DELETE FROM events');

        await this.dbService.run(
            "DELETE FROM sqlite_sequence WHERE name IN ('events')",
        );
    }

    static instance = null;
    static async create(...args) {
        if (!EventService.instance) {
            EventService.instance = new EventService();
            await EventService.instance.start(...args);
        }
        return EventService.instance;
    }
}
