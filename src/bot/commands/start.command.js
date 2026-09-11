'use strict';

const { isAdmin } = require('../../admin/auth/authorization');

async function startCommand(ctx) {
  const greeting = [
    'Welcome to Drive X Support Bot.',
    '',
    'This bot manages product posts for the Drive X gaming marketplace Channel.',
  ];

  if (isAdmin(ctx.from.id)) {
    greeting.push('', 'Use /admin to open the admin menu.');
  } else {
    greeting.push('', 'Browse products in our Channel, or use /help for more info.');
  }

  await ctx.reply(greeting.join('\n'));
}

module.exports = startCommand;
