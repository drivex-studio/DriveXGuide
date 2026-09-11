'use strict';

const db = require('../db');
const config = require('../../config/env');

const insertStmt = db.prepare(
  `INSERT OR IGNORE INTO admins (telegram_id, username, added_by) VALUES (?, ?, ?)`
);
const deleteStmt = db.prepare(`DELETE FROM admins WHERE telegram_id = ?`);
const findStmt = db.prepare(`SELECT * FROM admins WHERE telegram_id = ?`);
const listStmt = db.prepare(`SELECT * FROM admins ORDER BY created_at ASC`);

/**
 * The OWNER_TELEGRAM_ID from env is always an admin, even if the admins
 * table is empty (first boot) or gets wiped. This guarantees there is
 * always at least one account that can bootstrap the rest of the admin list.
 */
function isOwner(telegramId) {
  return Number(telegramId) === config.ownerTelegramId;
}

function isAdmin(telegramId) {
  if (isOwner(telegramId)) return true;
  return Boolean(findStmt.get(telegramId));
}

function addAdmin(telegramId, username, addedBy) {
  insertStmt.run(telegramId, username || null, addedBy || null);
  return findStmt.get(telegramId);
}

function removeAdmin(telegramId) {
  if (isOwner(telegramId)) {
    throw new Error('The owner account cannot be removed from admins.');
  }
  const result = deleteStmt.run(telegramId);
  return result.changes > 0;
}

function listAdmins() {
  return listStmt.all();
}

module.exports = {
  isOwner,
  isAdmin,
  addAdmin,
  removeAdmin,
  listAdmins,
};
