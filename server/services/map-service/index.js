import { DBService } from '../db-service/index.js';
import { default as generate } from 'boring-name-generator';

export class MapService {
    async start() {
        this.dbService = await DBService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS maps (
                    id INTEGER PRIMARY KEY AUTOINCREMENT
                );
            `,
        );

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS segments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    map_id INTEGER NOT NULL,
                    line INTEGER NOT NULL,
                    first_station_id INTEGER,
                    second_station_id INTEGER
                );
            `,
        );

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS stations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    map_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    x INTEGER NOT NULL,
                    y INTEGER NOT NULL
                );
            `,
        );
    }

    async createMap(segments, stations) {
        const ids = {};
        const { lastID: mapId } = await this.dbService.run(
            'INSERT INTO maps DEFAULT VALUES RETURNING id',
            [],
        );
        for (const station of stations) {
            const id = await this.createStation(
                mapId,
                station.name,
                station.x,
                station.y,
            );
            ids[station.name] = id;
        }

        for (const segment of segments) {
            await this.createSegment(
                mapId,
                segment.line,
                ids[segment.first_station_name],
                ids[segment.second_station_name],
            );
        }
        return mapId;
    }

    async createSegment(mapId, line, firstStationId, secondStationId) {
        return await this.dbService.run(
            'INSERT INTO segments (map_id, line, first_station_id, second_station_id) VALUES (?, ?, ?, ?)',
            [mapId, line, firstStationId, secondStationId],
        );
    }

    async createStation(mapId, name, x, y) {
        const { lastID } = await this.dbService.run(
            'INSERT INTO stations (map_id, name, x, y) VALUES (?, ?, ?, ?) RETURNING id',
            [mapId, name, x, y],
        );
        return lastID;
    }

    async getStations(mapId) {
        return await this.dbService.all(
            'SELECT id, name, x, y FROM stations WHERE map_id = ?',
            [mapId],
        );
    }

    async getSegments(mapId) {
        return await this.dbService.all(
            'SELECT id, line, first_station_id, second_station_id FROM segments WHERE map_id = ?',
            [mapId],
        );
    }

    async getMap(mapId = 1) {
        return {
            id: mapId,
            segments: await this.getSegments(mapId),
            stations: await this.getStations(mapId),
        };
    }

    static instance = null;
    static async create(...args) {
        if (!MapService.instance) {
            MapService.instance = new MapService();
            await MapService.instance.start(...args);
        }
        return MapService.instance;
    }
}
