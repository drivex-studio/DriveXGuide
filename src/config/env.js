'use strict';

require('dotenv').config();

/**
 * Centralized, validated environment configuration.
 * Every other module reads config from here instead of touching
 * process.env directly, so secrets are never scattered around the codebase.
 */

function required(name, { allowEmpty = false } = {}) {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && value.trim() === '')) {
    throw new Error(
      `[config] Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

function optional(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return fallback;
  return value;
}

const config = {
  botToken: required('BOT_TOKEN'),
  ownerTelegramId: Number(required('OWNER_TELEGRAM_ID')),
  adminUsername: optional('ADMIN_USERNAME', 'zaiiC0').replace(/^@/, ''),

  // Storage
  databaseUrl: optional('DATABASE_URL', './data/drivex.sqlite'),

  // These can also be configured later at runtime via /admin > Channel Settings,
  // but pre-seeding them from env is convenient for first deploy.
  targetChannelId: optional('TARGET_CHANNEL_ID', null),
  targetGroupId: optional('TARGET_GROUP_ID', null),

  // Runtime mode
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  // Optional webhook config (for Cloud Run deployment). If WEBHOOK_DOMAIN is
  // not set, the bot falls back to long-polling, which is fine for local dev.
  webhookDomain: optional('WEBHOOK_DOMAIN', null),
  port: Number(optional('PORT', '8080')),
};

if (Number.isNaN(config.ownerTelegramId)) {
  throw new Error('[config] OWNER_TELEGRAM_ID must be a numeric Telegram user ID.');
}

module.exports = config;
