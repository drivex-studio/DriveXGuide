'use strict';

const productService = require('../../products/product.service');
const channelService = require('../../telegram/channel.service');
const { formatProductPost } = require('../../products/product.formatter');
const { previewKeyboard, backToMenuKeyboard } = require('../keyboards/product.keyboard');
const { SCENE_ID: CREATE_PRODUCT_SCENE } = require('../scenes/createProduct.scene');
const logger = require('../../utils/logger');

/**
 * All callback_data here embeds a numeric product id (e.g. "product:publish:42").
 * We never trust that blindly: every handler re-fetches the product from the
 * database and checks it actually exists before acting on it.
 */

function extractProductId(ctx) {
  const parts = ctx.match[0].split(':');
  const id = Number(parts[2]);
  return Number.isFinite(id) ? id : null;
}

function registerProductCallbacks(bot, requireAdmin) {
  bot.action(/^product:preview:(\d+)$/, requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    const id = extractProductId(ctx);
    const product = productService.getById(id);
    if (!product) {
      await ctx.reply(`Product #${id} was not found (it may have been deleted).`);
      return;
    }

    const caption = `Preview\n\n${formatProductPost(product)}`;
    const keyboard = previewKeyboard(product.id);
    if (product.imageFileId) {
      await ctx.replyWithPhoto(product.imageFileId, { caption, parse_mode: 'HTML', ...keyboard });
    } else {
      await ctx.reply(caption, { parse_mode: 'HTML', ...keyboard });
    }
  });

  bot.action(/^product:edit:(\d+)$/, requireAdmin(), async (ctx) => {
    await ctx.answerCbQuery();
    const id = extractProductId(ctx);
    const product = productService.getById(id);
    if (!product) {
      await ctx.reply(`Product #${id} was not found (it may have been deleted).`);
      return;
    }
    await ctx.scene.enter(CREATE_PRODUCT_SCENE, { editingProductId: id });
  });

  bot.action(/^product:publish:(\d+)$/, requireAdmin(), async (ctx) => {
    const id = extractProductId(ctx);
    const product = productService.getById(id);
    if (!product) {
      await ctx.answerCbQuery('Product not found.', { show_alert: true });
      return;
    }

    await ctx.answerCbQuery('Publishing…');

    try {
      const sentMessage = await channelService.publishProduct(ctx.telegram, product);
      productService.markPublished(id, sentMessage.message_id, sentMessage.chat.id);
      await ctx.reply(`Product published successfully.\n\n#${id} — ${product.name}`, backToMenuKeyboard());
    } catch (err) {
      if (err.constructor.name === 'ChannelError') {
        await ctx.reply(err.message, backToMenuKeyboard());
        return;
      }
      logger.error('Unexpected error while publishing product', err, { productId: id });
      await ctx.reply('Publishing failed due to an unexpected error. Please try again.', backToMenuKeyboard());
    }
  });
}

module.exports = { registerProductCallbacks };
