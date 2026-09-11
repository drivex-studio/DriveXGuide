'use strict';

const settingsRepository = require('../database/repositories/settingsRepository');
const { formatProductPost } = require('../products/product.formatter');
const { customerActionKeyboard } = require('../bot/keyboards/product.keyboard');
const logger = require('../utils/logger');

class ChannelError extends Error {}

/**
 * Confirms the bot is actually an administrator of the target chat with
 * permission to post — Telegram will otherwise reject the send with a
 * generic 403, which is a bad error message to show an admin.
 */
async function verifyCanPostToChannel(telegram, chatId) {
  let member;
  try {
    member = await telegram.getChatMember(chatId, (await telegram.getMe()).id);
  } catch (err) {
    throw new ChannelError(
      'Could not find that Channel, or the bot has not been added to it yet. ' +
        'Double-check the Channel username/ID and make sure the bot is a member.'
    );
  }

  const isPrivileged = member.status === 'administrator' || member.status === 'creator';
  const canPost =
    member.status === 'creator' ||
    (member.status === 'administrator' &&
      (member.can_post_messages === true || member.can_post_messages === undefined));
  // Some Bot API versions omit can_post_messages for channels where it's implied by admin rights.

  if (!isPrivileged || !canPost) {
    throw new ChannelError(
      'The bot does not have permission to post in this Channel. ' +
        'Please add the bot as an administrator and grant permission to post messages.'
    );
  }

  return true;
}

function getTargetChannelId() {
  const id = settingsRepository.getTargetChannelId();
  if (!id) {
    throw new ChannelError(
      'No target Channel is configured yet. Go to Admin Menu → Channel Settings first.'
    );
  }
  return id;
}

async function setTargetChannel(telegram, channelIdentifier) {
  // Accept @username or numeric chat id (e.g. -1001234567890).
  await verifyCanPostToChannel(telegram, channelIdentifier);
  settingsRepository.setTargetChannelId(channelIdentifier);
  return channelIdentifier;
}

/**
 * Publishes a product to the configured Channel with exactly the two
 * required buttons (Contact / Buy). Returns the sent message so the caller
 * can persist published_message_id for future editing/archiving.
 */
async function publishProduct(telegram, product) {
  const chatId = getTargetChannelId();
  await verifyCanPostToChannel(telegram, chatId);

  const caption = formatProductPost(product);
  const keyboard = customerActionKeyboard();

  try {
    let sentMessage;
    if (product.imageFileId) {
      sentMessage = await telegram.sendPhoto(chatId, product.imageFileId, {
        caption,
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup,
      });
    } else {
      sentMessage = await telegram.sendMessage(chatId, caption, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup,
      });
    }
    return sentMessage;
  } catch (err) {
    logger.error('Failed to publish product to channel', err, { productId: product.id, chatId });
    throw new ChannelError(
      'Publishing failed. Telegram rejected the message — this is usually a ' +
        'formatting issue or a temporary API error. Please try again.'
    );
  }
}

module.exports = {
  ChannelError,
  verifyCanPostToChannel,
  setTargetChannel,
  getTargetChannelId,
  publishProduct,
};
