'use strict';

const { Scenes } = require('telegraf');
const productService = require('../../products/product.service');
const { formatProductPost } = require('../../products/product.formatter');
const { previewKeyboard } = require('../keyboards/product.keyboard');
const {
  ValidationError,
  validateProductName,
  validateDescription,
  parseDetails,
  validatePrice,
} = require('../../utils/validators');

const SCENE_ID = 'create-product-wizard';

/**
 * Step-by-step admin form (spec section 9).
 *
 * Skip semantics:
 *  - In CREATE mode, "name" and "price" are required and cannot be skipped;
 *    "description", "details", and "image" are optional and "skip" leaves
 *    them empty.
 *  - In EDIT mode (ctx.wizard.state.editingProductId is set), every field
 *    already has a current value pre-loaded, so "skip" always means
 *    "keep the current value" for every step.
 */

function isEditing(ctx) {
  return Boolean(ctx.wizard.state.editingProductId);
}

function isSkip(text) {
  return /^skip$/i.test((text || '').trim());
}

async function askName(ctx) {
  const editingId = ctx.scene.state && ctx.scene.state.editingProductId;
  const editing = editingId ? productService.getById(editingId) : null;

  ctx.wizard.state.draft = editing
    ? {
        name: editing.name,
        description: editing.description,
        details: editing.details,
        price: editing.price,
        currency: editing.currency,
        imageFileId: editing.imageFileId,
      }
    : {};
  ctx.wizard.state.editingProductId = editing ? editing.id : null;

  const hint = editing ? `\n(current: ${editing.name}) — send "skip" to keep it` : '';
  await ctx.reply(`Product name?${hint}`);
  return ctx.wizard.next();
}

async function onName(ctx) {
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply('Please send the product name as text.');
    return;
  }
  const text = ctx.message.text.trim();

  if (isSkip(text)) {
    if (!isEditing(ctx)) {
      await ctx.reply('Product name is required and cannot be skipped. Please send a name.');
      return;
    }
    // edit mode: keep ctx.wizard.state.draft.name as already pre-loaded
  } else {
    try {
      ctx.wizard.state.draft.name = validateProductName(text);
    } catch (err) {
      if (err instanceof ValidationError) return ctx.reply(err.message);
      throw err;
    }
  }

  const current = ctx.wizard.state.draft.description;
  const hint = isEditing(ctx)
    ? `\n(current: ${current || '(none)'}) — send "skip" to keep it`
    : ' (or send "skip" to leave it blank)';
  await ctx.reply(`Description?${hint}`);
  return ctx.wizard.next();
}

async function onDescription(ctx) {
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply('Please send a description, or "skip".');
    return;
  }
  const text = ctx.message.text.trim();

  if (isSkip(text)) {
    if (!isEditing(ctx)) ctx.wizard.state.draft.description = null;
    // edit mode: keep pre-loaded value
  } else {
    try {
      ctx.wizard.state.draft.description = validateDescription(text);
    } catch (err) {
      if (err instanceof ValidationError) return ctx.reply(err.message);
      throw err;
    }
  }

  await ctx.reply(
    'Details? Send one bullet point per line, or "skip".\nExample:\n60+ Skins\nMythic Rank\nFull Access'
  );
  return ctx.wizard.next();
}

async function onDetails(ctx) {
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply('Please send the details as text, or "skip".');
    return;
  }
  const text = ctx.message.text.trim();

  if (isSkip(text)) {
    if (!isEditing(ctx)) ctx.wizard.state.draft.details = [];
    // edit mode: keep pre-loaded value
  } else {
    ctx.wizard.state.draft.details = parseDetails(text);
  }

  const current = ctx.wizard.state.draft.price;
  const hint = isEditing(ctx) ? `\n(current: ${current}) — send "skip" to keep it` : '';
  await ctx.reply(`Price? (number only, e.g. 25 or 25.99)${hint}`);
  return ctx.wizard.next();
}

async function onPrice(ctx) {
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply('Please send the price as a number.');
    return;
  }
  const text = ctx.message.text.trim();

  if (isSkip(text)) {
    if (!isEditing(ctx)) {
      await ctx.reply('Price is required and cannot be skipped. Please send a number.');
      return;
    }
    // edit mode: keep pre-loaded value
  } else {
    try {
      ctx.wizard.state.draft.price = validatePrice(text);
    } catch (err) {
      if (err instanceof ValidationError) return ctx.reply(err.message);
      throw err;
    }
  }

  await ctx.reply('Product image? Send a photo, or "skip" for a text-only post.');
  return ctx.wizard.next();
}

async function onImage(ctx) {
  if (ctx.message && ctx.message.photo && ctx.message.photo.length > 0) {
    // Telegram sends multiple sizes; the last one is the highest resolution.
    const largest = ctx.message.photo[ctx.message.photo.length - 1];
    ctx.wizard.state.draft.imageFileId = largest.file_id;
  } else if (ctx.message && ctx.message.text && isSkip(ctx.message.text)) {
    if (!isEditing(ctx)) {
      ctx.wizard.state.draft.imageFileId = null;
    }
    // edit mode: keep pre-loaded image
  } else {
    await ctx.reply('Please send a photo, or type "skip".');
    return;
  }

  return showPreviewAndFinish(ctx);
}

async function showPreviewAndFinish(ctx) {
  const draft = ctx.wizard.state.draft;
  const editingId = ctx.wizard.state.editingProductId;

  let product;
  try {
    product = editingId
      ? productService.updateDraft(editingId, draft)
      : productService.createDraft(draft, ctx.from.id);
  } catch (err) {
    if (err instanceof ValidationError) {
      await ctx.reply(`Could not save product: ${err.message}`);
      return ctx.scene.leave();
    }
    throw err;
  }

  const caption = `Preview\n\n${formatProductPost(product)}`;
  const keyboard = previewKeyboard(product.id);

  if (product.imageFileId) {
    await ctx.replyWithPhoto(product.imageFileId, {
      caption,
      parse_mode: 'HTML',
      ...keyboard,
    });
  } else {
    await ctx.reply(caption, { parse_mode: 'HTML', ...keyboard });
  }

  return ctx.scene.leave();
}

const createProductScene = new Scenes.WizardScene(
  SCENE_ID,
  askName,
  onName,
  onDescription,
  onDetails,
  onPrice,
  onImage
);

module.exports = { createProductScene, SCENE_ID };
