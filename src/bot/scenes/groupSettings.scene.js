'use strict';

const { Scenes } = require('telegraf');
const groupService = require('../../telegram/group.service');
const { backToMenuKeyboard } = require('../keyboards/product.keyboard');

const SCENE_ID = 'group-settings-scene';

const groupSettingsScene = new Scenes.BaseScene(SCENE_ID);

groupSettingsScene.enter(async (ctx) => {
  const current = groupService.getTargetGroupId();

  const lines = [
    'Group Settings',
    '',
    current ? `Current Group: ${current}` : 'No Group configured yet.',
    '',
    'Send the Group username (e.g. @drivexsupport) or numeric Group ID.',
    'Make sure the bot has already been added to that Group.',
    '',
    'Send /cancel to go back without changing anything.',
  ];
  await ctx.reply(lines.join('\n'));
});

groupSettingsScene.on('text', async (ctx) => {
  const input = ctx.message.text.trim();

  try {
    await groupService.setTargetGroup(ctx.telegram, input);
    await ctx.reply(`Group configured: ${input}`, backToMenuKeyboard());
  } catch (err) {
    if (err.constructor.name === 'GroupError') {
      await ctx.reply(err.message);
      return;
    }
    throw err;
  }

  return ctx.scene.leave();
});

module.exports = { groupSettingsScene, SCENE_ID };
