'use strict';

const { Scenes } = require('telegraf');
const channelService = require('../../telegram/channel.service');
const { backToMenuKeyboard } = require('../keyboards/product.keyboard');

const SCENE_ID = 'channel-settings-scene';

const channelSettingsScene = new Scenes.BaseScene(SCENE_ID);

channelSettingsScene.enter(async (ctx) => {
  let current = null;
  try {
    current = channelService.getTargetChannelId();
  } catch {
    current = null;
  }

  const lines = [
    'Channel Settings',
    '',
    current ? `Current Channel: ${current}` : 'No Channel configured yet.',
    '',
    'Send the Channel username (e.g. @drivexmarket) or numeric Channel ID.',
    'Make sure the bot has already been added to that Channel as an administrator ' +
      'with permission to post messages.',
    '',
    'Send /cancel to go back without changing anything.',
  ];
  await ctx.reply(lines.join('\n'));
});

channelSettingsScene.on('text', async (ctx) => {
  const input = ctx.message.text.trim();

  try {
    await channelService.setTargetChannel(ctx.telegram, input);
    await ctx.reply(`Channel configured: ${input}`, backToMenuKeyboard());
  } catch (err) {
    // ChannelError has a clean, user-facing message; anything else rethrows
    // to the global error handler so it gets logged.
    if (err.constructor.name === 'ChannelError') {
      await ctx.reply(err.message);
      return; // stay in the scene so they can retry
    }
    throw err;
  }

  return ctx.scene.leave();
});

module.exports = { channelSettingsScene, SCENE_ID };
