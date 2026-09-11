'use strict';

const { Markup } = require('telegraf');

function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Create Product', 'menu:create_product')],
    [Markup.button.callback('Drafts', 'menu:list_drafts')],
    [Markup.button.callback('Published Posts', 'menu:list_published')],
    [Markup.button.callback('Manage Admins', 'menu:manage_admins')],
    [Markup.button.callback('Channel Settings', 'menu:channel_settings')],
    [Markup.button.callback('Group Settings', 'menu:group_settings')],
  ]);
}

module.exports = { mainMenuKeyboard };
