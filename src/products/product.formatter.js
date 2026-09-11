'use strict';

const escapeHtml = require('../utils/escapeHtml');

/**
 * Renders a product into the final Telegram post text (HTML parse mode).
 * Style rules from the spec: clear name, short description, minimal emoji
 * (exactly one, on the title), clean spacing, price immediately visible,
 * no fake urgency / decorative clutter.
 */
function formatProductPost(product) {
  const lines = [];

  lines.push(`🎮 <b>${escapeHtml(product.name)}</b>`);

  if (product.description) {
    lines.push(escapeHtml(product.description));
  }

  if (product.details && product.details.length > 0) {
    lines.push('');
    lines.push('<b>Details:</b>');
    for (const detail of product.details) {
      lines.push(`• ${escapeHtml(detail)}`);
    }
  }

  lines.push('');
  lines.push(`<b>Price:</b> ${formatPrice(product.price, product.currency)}`);
  lines.push('Contact us if you have any questions.');

  return lines.join('\n');
}

function formatPrice(price, currency) {
  const amount = Number(price).toFixed(Number.isInteger(price) ? 0 : 2);
  return currency === 'USD' ? `$${amount}` : `${amount} ${currency}`;
}

/**
 * Short one-line summary used in admin list views (e.g. "pick a draft to publish").
 */
function formatProductSummary(product) {
  return `#${product.id} — ${product.name} (${formatPrice(product.price, product.currency)}) [${product.status}]`;
}

module.exports = {
  formatProductPost,
  formatPrice,
  formatProductSummary,
};
