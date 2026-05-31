import crypto from 'crypto';
import { promisify } from 'util';

import { DBService } from '../db-service/index.js';
import { MapService } from '../map-service/index.js';
import { EventService } from '../event-service/index.js';

export class GameService {
    mapService;
    eventService;
    dbService;

    async start() {
        this.dbService = await DBService.create();
        this.mapService = await MapService.create();
        this.eventService = await EventService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NULL,
                    score INTEGER DEFAULT 20,
                    map_id INTEGER NOT NULL,
                    start_station_id INTEGER DEFAULT NULL,
                    end_station_id INTEGER DEFAULT NULL,
                    is_over INTEGER DEFAULT 0,
                    was_solved INTEGER DEFAULT 0,
                    creation_date TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `,
        );
    }

    async createGame() {
        const map = await this.mapService.getMap();
        const { id } = await this.dbService.get(
            'INSERT INTO games (user_id, map_id) VALUES (NULL, ?) RETURNING id',
            [map.id],
        );
        return this.getGame(id);
    }

    async launchGame(gameId, userId) {
        const { map } = await this.getGame(gameId);
        const { startStationId, endStationId } =
            await this.mapService.getRandomStationPair(map.id);
        await this.dbService.run(
            'UPDATE games SET user_id = ?, start_station_id = ?, end_station_id = ? WHERE id = ?',
            [userId, startStationId, endStationId, gameId],
        );

        return this.getGame(gameId);
    }

    async submitAnswer(gameId, answer) {
        const game = await this.getGame(gameId);
        const isValid = await this.mapService.isPathValid(
            game.map.id,
            game.startStationId,
            game.endStationId,
            answer,
        );

        let newScore = game.score;
        let events = [];
        if (isValid) {
            events = await this.eventService.sampleEvents(answer.length);
            newScore += events.reduce((acc, event) => acc + event.effect, 0);
            events = events.map((event, i) => ({
                event,
                answer: answer[i],
            }));
        } else {
            newScore = 0;
        }

        await this.dbService.run(
            'UPDATE games SET score = ?, is_over = ?, was_solved = ? WHERE id = ?',
            [newScore, 1, isValid ? 1 : 0, gameId],
        );
        return { game: await this.getGame(gameId), events };
    }

    async getGame(id) {
        const {
            user_id: userId,
            score,
            map_id: mapId,
            start_station_id: startStationId,
            end_station_id: endStationId,
            creation_date: creationDate,
            was_solved: wasSolved,
            is_over: isOver,
        } = await this.dbService.get('SELECT * FROM games WHERE id = ?', [id]);

        return {
            id,
            userId,
            score,
            map: await this.mapService.getMap(mapId),
            startStationId,
            endStationId,
            creationDate,
            wasSolved,
            isOver,
        };
    }

    async getFinishedGames(userId) {
        const games = await this.dbService.all(
            'SELECT id, score, map_id, start_station_id, end_station_id, creation_date, was_solved, is_over FROM games WHERE user_id = ? AND is_over = 1',
            [userId],
        );
        return Promise.all(
            games.map(async (game) => ({
                id: game.id,
                score: game.score,
                userId,
                map: await this.mapService.getMap(game.map_id),
                startStationId: game.start_station_id,
                endStationId: game.end_station_id,
                creationDate: game.creation_date,
                wasSolved: game.was_solved,
                isOver: game.is_over,
            })),
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
