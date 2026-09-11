'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config/env');

// Make sure the folder that will hold the sqlite file exists (works for both
// './data/drivex.sqlite' locally and a mounted volume path in production).
const dbDir = path.dirname(config.databaseUrl);
if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(config.databaseUrl);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    telegram_id INTEGER PRIMARY KEY,
    username    TEXT,
    added_by    INTEGER,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    description      TEXT,
    category         TEXT,
    details          TEXT,          -- JSON-encoded array of bullet strings
    price            REAL NOT NULL,
    currency         TEXT NOT NULL DEFAULT 'USD',
    image_file_id    TEXT,          -- Telegram file_id, not a raw file upload
    status           TEXT NOT NULL DEFAULT 'draft', -- draft | published | archived
    published_message_id INTEGER,
    published_chat_id    TEXT,
    created_by       INTEGER,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Persists Telegraf session/scene state across restarts and multiple
  -- Cloud Run instances so an admin's in-progress "Create Product" wizard
  -- is not lost if the container recycles between steps.
  CREATE TABLE IF NOT EXISTS sessions (
    session_key TEXT PRIMARY KEY,
    data        TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
