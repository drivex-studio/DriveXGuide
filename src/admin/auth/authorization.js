'use strict';

const adminRepository = require('../../database/repositories/adminRepository');
const logger = require('../../utils/logger');

/**
 * Pure check, safe to call from anywhere (commands, callbacks, scenes).
 */
function isAdmin(telegramId) {
  return adminRepository.isAdmin(telegramId);
}

function isOwner(telegramId) {
  return adminRepository.isOwner(telegramId);
}

/**
 * Telegraf middleware. Attach to any command/action that must be
 * restricted to authorized admins:
 *
 *   bot.command('admin', requireAdmin(), adminMenuHandler);
 *   bot.action(/^product:publish:/, requireAdmin(), publishHandler);
 *
 * Every admin-only entry point in the bot must go through this — do not
 * hand-roll ID checks inside individual handlers.
 */
function requireAdmin() {
  return async (ctx, next) => {
    const userId = ctx.from && ctx.from.id;

    if (!userId || !isAdmin(userId)) {
      logger.warn('Blocked unauthorized access attempt', {
        userId,
        username: ctx.from && ctx.from.username,
        update: ctx.updateType,
      });

      const message = 'You are not authorized to use this command.';
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery(message, { show_alert: true }).catch(() => {});
      } else {
        await ctx.reply(message).catch(() => {});
      }
      return; // do not call next() — request stops here
    }

    return next();
  };
}

/**
 * Same as requireAdmin(), but restricted to the owner only
 * (e.g. removing another admin, in case that policy is tightened later).
 */
function requireOwner() {
  return async (ctx, next) => {
    const userId = ctx.from && ctx.from.id;
    if (!userId || !isOwner(userId)) {
      const message = 'Only the bot owner can do this.';
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery(message, { show_alert: true }).catch(() => {});
      } else {
        await ctx.reply(message).catch(() => {});
      }
      return;
    }
    return next();
  };
}

module.exports = {
  isAdmin,
  isOwner,
  requireAdmin,
  requireOwner,
};
