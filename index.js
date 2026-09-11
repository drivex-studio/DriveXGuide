'use strict';

const config = require('./src/config/env');
const createBot = require('./src/bot/bot');
const logger = require('./src/utils/logger');

// Touch the DB module early so schema creation happens on boot, before the
// first update arrives.
require('./src/database/db');

const bot = createBot();

async function start() {
  if (config.webhookDomain) {
    // Production mode: Cloud Run (or any HTTPS host) — Telegraf spins up its
    // own lightweight HTTP server bound to $PORT and registers the webhook
    // with Telegram automatically.
    const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
    await bot.telegram.setWebhook(`${config.webhookDomain}${webhookPath}`);
    await bot.launch({
      webhook: {
        domain: config.webhookDomain,
        path: webhookPath,
        port: config.port,
      },
    });
    logger.info(`Drive X Support Bot running in webhook mode on port ${config.port}`);
  } else {
    // Local development: simple long polling, no public URL needed.
    await bot.launch();
    logger.info('Drive X Support Bot running in long-polling mode.');
  }
}

start().catch((err) => {
  logger.error('Failed to start bot', err);
  process.exit(1);
});

// Graceful shutdown so Cloud Run / systemd restarts don't kill mid-request.
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
