'use strict';

const { isAdmin } = require('../../admin/auth/authorization');

async function helpCommand(ctx) {
  const lines = [
    'Drive X Support Bot — commands',
    '',
    '/start — welcome message',
    '/help — this message',
  ];

  if (isAdmin(ctx.from.id)) {
    lines.push(
      '/admin — open the admin menu (create/preview/publish products, manage admins, configure Channel/Group)',
      '/cancel — cancel whatever step-by-step flow you are currently in'
    );
  }

  await ctx.reply(lines.join('\n'));
}

module.exports = helpCommand;
