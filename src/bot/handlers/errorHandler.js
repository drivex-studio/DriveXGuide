'use strict';

const logger = require('../../utils/logger');

/**
 * Registered via bot.catch(). This is the last line of defense — individual
 * commands/scenes already wrap themselves with safeHandler, but Telegraf's
 * own middleware chain (e.g. scene errors) can still bubble up here.
 * Never expose stack traces to the Telegram user (spec section 13).
 */
function registerErrorHandler(bot) {
  bot.catch(async (err, ctx) => {
    logger.error('Unhandled bot error', err, {
      updateType: ctx.updateType,
      userId: ctx.from && ctx.from.id,
    });

    try {
      const message = 'Something went wrong. Please try again, or use /cancel and start over.';
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery(message, { show_alert: true });
      } else {
        await ctx.reply(message);
      }
    } catch {
      // Chat may be unreachable; nothing more we can do.
    }
  });
}

module.exports = { registerErrorHandler };
