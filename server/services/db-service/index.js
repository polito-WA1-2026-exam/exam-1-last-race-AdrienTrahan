import sqlite from 'sqlite3';

export class DBService {
    db;

    async start() {
        this.db = new sqlite.Database('./db.sqlite', (err) => {
            if (err) throw err;
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static instance = null;
    static async create(...args) {
        if (!DBService.instance) {
            DBService.instance = new DBService();
            await DBService.instance.start(...args);
        }
        return DBService.instance;
    }
}
