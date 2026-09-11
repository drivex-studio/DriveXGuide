'use strict';

const logger = require('../utils/logger');

/**
 * Wraps a handler so that any thrown error is logged with full detail on
 * the server, and the Telegram user only ever sees a short, clean message.
 * Errors that were deliberately thrown as "expected" (ValidationError,
 * ChannelError, GroupError) surface their own .message; anything else is
 * shown as a generic message so internals never leak (spec section 13).
 */
function safeHandler(handler) {
  return async (ctx, ...args) => {
    try {
      await handler(ctx, ...args);
    } catch (err) {
      logger.error('Unhandled error in bot handler', err, {
        userId: ctx.from && ctx.from.id,
        updateType: ctx.updateType,
      });

      const isKnownError =
        err && ['ValidationError', 'ChannelError', 'GroupError'].includes(err.constructor.name);
      const userMessage = isKnownError
        ? err.message
        : 'Something went wrong. Please try again, or contact the bot owner if this keeps happening.';

      try {
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery(userMessage, { show_alert: true });
        } else {
          await ctx.reply(userMessage);
        }
      } catch {
        // Swallow secondary failures (e.g. chat no longer reachable) — the
        // original error is already logged above.
      }
    }
  };
}

module.exports = { safeHandler };
