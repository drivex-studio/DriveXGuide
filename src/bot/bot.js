'use strict';

const { Telegraf, Scenes, session } = require('telegraf');
const config = require('../config/env');
const sqliteSessionStore = require('../database/sqliteSessionStore');
const { requireAdmin } = require('../admin/auth/authorization');
const { safeHandler } = require('../telegram/message.service');

const startCommand = require('./commands/start.command');
const helpCommand = require('./commands/help.command');
const cancelCommand = require('./commands/cancel.command');
const adminCommand = require('./commands/admin.command');

const { createProductScene } = require('./scenes/createProduct.scene');
const { channelSettingsScene } = require('./scenes/channelSettings.scene');
const { groupSettingsScene } = require('./scenes/groupSettings.scene');
const { manageAdminsScene } = require('./scenes/manageAdmins.scene');

const { registerMenuCallbacks } = require('./callbacks/menu.callback');
const { registerProductCallbacks } = require('./callbacks/product.callback');
const { registerErrorHandler } = require('./handlers/errorHandler');

function createBot() {
  const bot = new Telegraf(config.botToken);

  bot.use(session({ store: sqliteSessionStore() }));

  const stage = new Scenes.Stage([
    createProductScene,
    channelSettingsScene,
    groupSettingsScene,
    manageAdminsScene,
  ]);
  bot.use(stage.middleware());

  // Public commands
  bot.start(safeHandler(startCommand));
  bot.help(safeHandler(helpCommand));
  bot.command('cancel', safeHandler(cancelCommand));

  // Admin-only commands
  bot.command('admin', requireAdmin(), safeHandler(adminCommand));

  // Callback (inline button) handlers
  registerMenuCallbacks(bot, requireAdmin);
  registerProductCallbacks(bot, requireAdmin);

  registerErrorHandler(bot);

  return bot;
}

module.exports = createBot;
