'use strict';

const { mainMenuKeyboard } = require('../keyboards/mainMenu.keyboard');

async function adminCommand(ctx) {
  await ctx.reply('Drive X Support Bot — Admin menu', mainMenuKeyboard());
}

module.exports = adminCommand;
