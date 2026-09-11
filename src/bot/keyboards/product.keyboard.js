'use strict';

const { Markup } = require('telegraf');
const config = require('../../config/env');

/**
 * The ONLY keyboard that ever gets published to the public Channel.
 * Business rule (spec section 21): exactly two buttons, both open the
 * admin's Telegram DM. No automated checkout, no extra buttons.
 */
function customerActionKeyboard() {
  const adminUrl = `https://t.me/${config.adminUsername}`;
  return Markup.inlineKeyboard([
    [Markup.button.url('Contact', adminUrl), Markup.button.url('Buy', adminUrl)],
  ]);
}

/**
 * Admin-only preview keyboard shown before publishing (spec section 9).
 * productId is embedded in callback_data so the handler knows which draft
 * to act on; it is validated server-side against the authenticated admin's
 * session before anything is published (never trust callback_data blindly).
 */
function previewKeyboard(productId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Edit', `product:edit:${productId}`),
      Markup.button.callback('Publish', `product:publish:${productId}`),
    ],
    [Markup.button.callback('« Back to menu', 'menu:root')],
  ]);
}

function draftListItemKeyboard(productId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Preview', `product:preview:${productId}`),
      Markup.button.callback('Publish', `product:publish:${productId}`),
    ],
  ]);
}

function backToMenuKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('« Back to menu', 'menu:root')]]);
}

module.exports = {
  customerActionKeyboard,
  previewKeyboard,
  draftListItemKeyboard,
  backToMenuKeyboard,
};
