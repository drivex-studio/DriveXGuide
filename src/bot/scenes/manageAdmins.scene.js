'use strict';

const { Scenes, Markup } = require('telegraf');
const adminRepository = require('../../database/repositories/adminRepository');
const { requireOwner } = require('../../admin/auth/authorization');
const { backToMenuKeyboard } = require('../keyboards/product.keyboard');

const SCENE_ID = 'manage-admins-scene';

const manageAdminsScene = new Scenes.BaseScene(SCENE_ID);

function adminListText() {
  const admins = adminRepository.listAdmins();
  if (admins.length === 0) {
    return 'No additional admins yet (owner is always an admin).';
  }
  return admins
    .map((a) => `• ${a.telegram_id}${a.username ? ` (@${a.username})` : ''}`)
    .join('\n');
}

manageAdminsScene.enter(async (ctx) => {
  const lines = [
    'Manage Admins',
    '',
    adminListText(),
    '',
    'To add an admin, send: add <telegram_id>',
    'To remove an admin, send: remove <telegram_id>',
    '',
    'Send /cancel to go back.',
  ];
  await ctx.reply(lines.join('\n'));
});

manageAdminsScene.on('text', requireOwner(), async (ctx) => {
  const text = ctx.message.text.trim();
  const addMatch = text.match(/^add\s+(\d+)$/i);
  const removeMatch = text.match(/^remove\s+(\d+)$/i);

  if (addMatch) {
    const telegramId = Number(addMatch[1]);
    adminRepository.addAdmin(telegramId, null, ctx.from.id);
    await ctx.reply(`Added admin: ${telegramId}\n\n${adminListText()}`, backToMenuKeyboard());
    return;
  }

  if (removeMatch) {
    const telegramId = Number(removeMatch[1]);
    try {
      const removed = adminRepository.removeAdmin(telegramId);
      await ctx.reply(
        removed ? `Removed admin: ${telegramId}` : `That ID was not an admin.`,
        backToMenuKeyboard()
      );
    } catch (err) {
      await ctx.reply(err.message);
    }
    return;
  }

  await ctx.reply('Format not recognized. Use: "add <telegram_id>" or "remove <telegram_id>".');
});

module.exports = { manageAdminsScene, SCENE_ID };
