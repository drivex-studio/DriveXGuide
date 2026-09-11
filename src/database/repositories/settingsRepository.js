'use strict';

const db = require('../db');
const config = require('../../config/env');

const getStmt = db.prepare(`SELECT value FROM settings WHERE key = ?`);
const setStmt = db.prepare(
  `INSERT INTO settings (key, value) VALUES (?, ?)
   ON CONFLICT(key) DO UPDATE SET value = excluded.value`
);

const KEYS = {
  TARGET_CHANNEL_ID: 'target_channel_id',
  TARGET_GROUP_ID: 'target_group_id',
};

function get(key) {
  const row = getStmt.get(key);
  return row ? row.value : null;
}

function set(key, value) {
  setStmt.run(key, value === null || value === undefined ? null : String(value));
}

function getTargetChannelId() {
  // DB value wins once configured via /admin, but fall back to .env for
  // a fresh deploy that hasn't been configured through the bot yet.
  return get(KEYS.TARGET_CHANNEL_ID) || config.targetChannelId || null;
}

function setTargetChannelId(channelId) {
  set(KEYS.TARGET_CHANNEL_ID, channelId);
}

function getTargetGroupId() {
  return get(KEYS.TARGET_GROUP_ID) || config.targetGroupId || null;
}

function setTargetGroupId(groupId) {
  set(KEYS.TARGET_GROUP_ID, groupId);
}

module.exports = {
  getTargetChannelId,
  setTargetChannelId,
  getTargetGroupId,
  setTargetGroupId,
};
