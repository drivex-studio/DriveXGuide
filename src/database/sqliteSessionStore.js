'use strict';

const db = require('./db');

const getStmt = db.prepare(`SELECT data FROM sessions WHERE session_key = ?`);
const setStmt = db.prepare(`
  INSERT INTO sessions (session_key, data, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(session_key) DO UPDATE SET data = excluded.data, updated_at = datetime('now')
`);
const deleteStmt = db.prepare(`DELETE FROM sessions WHERE session_key = ?`);

/**
 * Minimal store implementing the { get, set, delete } interface Telegraf's
 * session() middleware expects. Backed by SQLite instead of memory so an
 * admin's in-progress product wizard survives a Cloud Run cold start or a
 * restart between two build steps.
 */
function sqliteSessionStore() {
  return {
    get(key) {
      const row = getStmt.get(key);
      if (!row) return undefined;
      try {
        return JSON.parse(row.data);
      } catch {
        return undefined;
      }
    },
    set(key, value) {
      setStmt.run(key, JSON.stringify(value));
    },
    delete(key) {
      deleteStmt.run(key);
    },
  };
}

module.exports = sqliteSessionStore;
