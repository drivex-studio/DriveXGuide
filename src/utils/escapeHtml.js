'use strict';

/**
 * We standardize on Telegram's HTML parse mode everywhere (see
 * products/product.formatter.js). HTML mode only has 3 special characters
 * that must be escaped in user-supplied text: & < >
 * (Unlike MarkdownV2, which requires escaping ~18 characters and is far
 * easier to accidentally break with normal product descriptions.)
 */
function escapeHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = escapeHtml;
