import { default as generate } from 'boring-name-generator';

import { DBService } from '../db-service/index.js';
import { InternalServerError } from '../../error.js';
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

    async isPathValid(mapId, startStationId, endStationId, path) {
        const { segments } = await this.getMap(mapId);
        if (startStationId === endStationId && path.length === 0) return true;
        for (const segmentId of path) {
            const segment = segments.find((s) => s.id === segmentId);
            if (segment.first_station_id === startStationId) {
                startStationId = segment.second_station_id;
            } else if (segment.second_station_id === startStationId) {
                startStationId = segment.first_station_id;
            } else {
                return false;
            }
        }
        return startStationId === endStationId;
    }

    async getRandomStationPair(mapId) {
        const stations = await this.dbService.all(
            'SELECT id, name FROM stations WHERE map_id = ?',
            [mapId],
        );
        const segments = await this.dbService.all(
            'SELECT first_station_id, second_station_id FROM segments WHERE map_id = ?',
            [mapId],
        );
        const adj = new Map();
        for (const s of stations) {
            adj.set(s.id, []);
        }
        for (const seg of segments) {
            adj.get(seg.first_station_id).push(seg.second_station_id);
            adj.get(seg.second_station_id).push(seg.first_station_id);
        }
        const validPairs = [];

        for (const start of stations) {
            const distances = new Map();
            const queue = [start.id];
            distances.set(start.id, 0);

            while (queue.length > 0) {
                const current = queue.shift();
                const currentDist = distances.get(current);

                for (const neighbor of adj.get(current)) {
                    if (!distances.has(neighbor)) {
                        distances.set(neighbor, currentDist + 1);
                        queue.push(neighbor);
                    }
                }
            }

            for (const end of stations) {
                if (start.id >= end.id) continue;
                const dist = distances.get(end.id);
                if (dist !== undefined && dist >= 4) {
                    validPairs.push({
                        start,
                        end,
                        distance: dist,
                    });
                }
            }
        }

        if (validPairs.length === 0) throw new InternalServerError();
        const randomIndex = Math.floor(Math.random() * validPairs.length);
        const pair = validPairs[randomIndex];

        return {
            startStationId: pair.start.id,
            endStationId: pair.end.id,
        };
    }

    async clearMaps() {
        await this.dbService.run('DELETE FROM segments');
        await this.dbService.run('DELETE FROM stations');
        await this.dbService.run('DELETE FROM maps');

        await this.dbService.run(
            "DELETE FROM sqlite_sequence WHERE name IN ('segments', 'stations', 'maps')",
        );
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
