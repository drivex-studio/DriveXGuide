'use strict';

const { mainMenuKeyboard } = require('../keyboards/mainMenu.keyboard');
const { SCENE_ID: CREATE_PRODUCT_SCENE } = require('../scenes/createProduct.scene');
const { SCENE_ID: CHANNEL_SETTINGS_SCENE } = require('../scenes/channelSettings.scene');
const { SCENE_ID: GROUP_SETTINGS_SCENE } = require('../scenes/groupSettings.scene');
const { SCENE_ID: MANAGE_ADMINS_SCENE } = require('../scenes/manageAdmins.scene');
const productService = require('../../products/product.service');
const { formatProductSummary } = require('../../products/product.formatter');
const { draftListItemKeyboard, backToMenuKeyboard } = require('../keyboards/product.keyboard');

function registerMenuCallbacks(bot, requireAdmin) {
  bot.action('menu:root', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText('Drive X Support Bot — Admin menu', mainMenuKeyboard()).catch(
      // editMessageText fails if the previous message was a photo caption;
      // fall back to a fresh message in that case.
      async () => ctx.reply('Drive X Support Bot — Admin menu', mainMenuKeyboard())
    );
  });

  bot.action('menu:create_product', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.enter(CREATE_PRODUCT_SCENE);
  });

  bot.action('menu:list_drafts', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    const drafts = productService.listDrafts();
    if (drafts.length === 0) {
      await ctx.reply('No drafts yet. Use "Create Product" to make one.', backToMenuKeyboard());
      return;
    }
    for (const product of drafts) {
      await ctx.reply(formatProductSummary(product), draftListItemKeyboard(product.id));
    }
  });

  bot.action('menu:list_published', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    const published = productService.listPublished();
    if (published.length === 0) {
      await ctx.reply('Nothing published yet.', backToMenuKeyboard());
      return;
    }
    const text = published.map(formatProductSummary).join('\n');
    await ctx.reply(text, backToMenuKeyboard());
  });

  bot.action('menu:manage_admins', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.enter(MANAGE_ADMINS_SCENE);
  });

  bot.action('menu:channel_settings', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.enter(CHANNEL_SETTINGS_SCENE);
  });

  bot.action('menu:group_settings', requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.enter(GROUP_SETTINGS_SCENE);
  });
}

module.exports = { registerMenuCallbacks };
