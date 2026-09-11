'use strict';

/**
 * Product status lifecycle:
 *   DRAFT      -> created via the wizard, not yet posted anywhere
 *   PUBLISHED  -> currently live in the target Channel
 *   ARCHIVED   -> was published before, pulled/replaced, kept for records
 */
const ProductStatus = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [category]
 * @property {string[]} details
 * @property {number} price
 * @property {string} currency
 * @property {string} [imageFileId]  Telegram file_id of the uploaded photo
 * @property {'draft'|'published'|'archived'} status
 * @property {number} [publishedMessageId]
 * @property {string} [publishedChatId]
 * @property {number} [createdBy]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

module.exports = { ProductStatus };
