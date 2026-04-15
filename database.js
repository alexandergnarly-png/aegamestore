const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            product_id INTEGER,
            access_token TEXT,
            name TEXT,
            contact TEXT,
            game TEXT,
            product TEXT,
            price INTEGER,
            payment_status TEXT,
            delivery_status TEXT,
            gameKey TEXT,
            created_at DATETIME
        )
    `);

    db.run(`ALTER TABLE orders ADD COLUMN access_token TEXT`, (err) => {
        if (err && !String(err.message).includes("duplicate column name")) {
            console.error("Gagal menambahkan kolom access_token:", err.message);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            key TEXT UNIQUE,
            used INTEGER DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game TEXT,
            brand TEXT,
            duration TEXT,
            price INTEGER,
            active INTEGER DEFAULT 1,
            created_at TEXT
        )
    `);
});

module.exports = db;