import crypto from 'crypto';
import { promisify } from 'util';
import passport from 'passport';
import { Strategy as BasicStrategy } from 'passport-local';
import cron from 'node-cron';

import { DBService } from '../db-service/index.js';

import { AppError, ResourceNotFound, UserNameTaken } from '../../error.js';

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

export const UserType = {
    LoggedIn: 'LoggedIn',
    Anonymous: 'Anonymous',
};

export class AuthService {
    async start() {
        this.dbService = await DBService.create();

        await this.dbService.run(
            `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT,
                    username TEXT,
                    password TEXT,
                    salt TEXT,
                    registration_date TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `,
        );

        this.configurePassport();
        cron.schedule('0 12 * * *', () => this.cleanUpAnonymous());
    }

    configurePassport() {
        passport.use(
            new BasicStrategy(async (username, password, done) => {
                try {
                    const user = await this.loginUser(username, password);
                    if (!user) return done(null, false);

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }),
        );

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await this.getUser(id);
                done(null, user);
            } catch (err) {
                done(err);
            }
        });
    }

    async registerUser(username, password) {
        username = username.toLowerCase();
        const existing = await this.dbService.get(
            'SELECT id FROM users WHERE username = ?',
            [username],
        );
        if (existing) throw new UserNameTaken();

        const salt = (await randomBytes(16)).toString('hex');
        const hash = (
            await pbkdf2(password, salt, 100000, 64, 'sha256')
        ).toString('hex');

        const user = await this.dbService.get(
            'INSERT INTO users (type, username, password, salt) VALUES (?, ?, ?, ?) RETURNING id, type, username, registration_date',
            [UserType.LoggedIn, username, hash, salt],
        );
        return user;
    }

    async loginUser(username, password) {
        username = username.toLowerCase();
        const user = await this.dbService.get(
            'SELECT * FROM users WHERE username = ?',
            [username],
        );
        if (!user) return null;

        const hash = (
            await pbkdf2(password, user.salt, 100000, 64, 'sha256')
        ).toString('hex');

        if (hash !== user.password) return null;

        return {
            id: user.id,
            type: user.type,
            username: user.username,
            registration_date: user.registration_date,
        };
    }

    async loginAnonymous() {
        const user = await this.dbService.get(
            'INSERT INTO users (type) VALUES (?) RETURNING id, type, username, registration_date',
            [UserType.Anonymous],
        );

        return user;
    }

    async getUser(id) {
        const user = await this.dbService.get(
            'SELECT id, type, username, registration_date FROM users WHERE id = ?',
            [id],
        );
        if (!user) throw new ResourceNotFound();
        return user;
    }

    async cleanUpAnonymous() {
        await this.dbService.run(
            "DELETE FROM users WHERE type = ? AND registration_date < datetime('now', '-1 day')",
            [UserType.Anonymous],
        );
    }

    static instance = null;
    static async create(...args) {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
            await AuthService.instance.start(...args);
        }
        return AuthService.instance;
    }
}
