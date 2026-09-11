'use strict';

const settingsRepository = require('../database/repositories/settingsRepository');

class GroupError extends Error {}

/**
 * Group support is intentionally minimal for v1 (spec section 12): just
 * confirm the bot can see the chat and store its ID. Support-ticket
 * routing, notifications, etc. can build on top of this later without
 * touching the rest of the architecture.
 */
async function verifyBotIsMember(telegram, chatId) {
  try {
    const me = await telegram.getMe();
    await telegram.getChatMember(chatId, me.id);
  } catch (err) {
    throw new GroupError(
      'Could not find that Group, or the bot has not been added to it yet. ' +
        'Double-check the Group username/ID and make sure the bot is a member.'
    );
  }
  return true;
}

function getTargetGroupId() {
  return settingsRepository.getTargetGroupId();
}

async function setTargetGroup(telegram, groupIdentifier) {
  await verifyBotIsMember(telegram, groupIdentifier);
  settingsRepository.setTargetGroupId(groupIdentifier);
  return groupIdentifier;
}

module.exports = {
  GroupError,
  getTargetGroupId,
  setTargetGroup,
};
