'use strict';

async function cancelCommand(ctx) {
  if (ctx.scene && ctx.scene.current) {
    await ctx.scene.leave();
    await ctx.reply('Cancelled.');
  } else {
    await ctx.reply('Nothing to cancel.');
  }
}

module.exports = cancelCommand;
