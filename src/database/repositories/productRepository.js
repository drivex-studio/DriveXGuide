'use strict';

const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO products (name, description, category, details, price, currency, image_file_id, status, created_by)
  VALUES (@name, @description, @category, @details, @price, @currency, @imageFileId, @status, @createdBy)
`);

const updateStmt = db.prepare(`
  UPDATE products SET
    name = @name,
    description = @description,
    category = @category,
    details = @details,
    price = @price,
    currency = @currency,
    image_file_id = @imageFileId,
    updated_at = datetime('now')
  WHERE id = @id
`);

const setStatusStmt = db.prepare(
  `UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?`
);

const setPublishedInfoStmt = db.prepare(`
  UPDATE products SET
    status = 'published',
    published_message_id = ?,
    published_chat_id = ?,
    updated_at = datetime('now')
  WHERE id = ?
`);

const findByIdStmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
const listByStatusStmt = db.prepare(
  `SELECT * FROM products WHERE status = ? ORDER BY updated_at DESC LIMIT ?`
);
const deleteStmt = db.prepare(`DELETE FROM products WHERE id = ?`);

function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    details: row.details ? JSON.parse(row.details) : [],
    price: row.price,
    currency: row.currency,
    imageFileId: row.image_file_id,
    status: row.status,
    publishedMessageId: row.published_message_id,
    publishedChatId: row.published_chat_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function create(product) {
  const info = insertStmt.run({
    name: product.name,
    description: product.description || null,
    category: product.category || null,
    details: product.details ? JSON.stringify(product.details) : null,
    price: product.price,
    currency: product.currency || 'USD',
    imageFileId: product.imageFileId || null,
    status: product.status || 'draft',
    createdBy: product.createdBy || null,
  });
  return findById(info.lastInsertRowid);
}

function update(id, product) {
  updateStmt.run({
    id,
    name: product.name,
    description: product.description || null,
    category: product.category || null,
    details: product.details ? JSON.stringify(product.details) : null,
    price: product.price,
    currency: product.currency || 'USD',
    imageFileId: product.imageFileId || null,
  });
  return findById(id);
}

function findById(id) {
  return rowToProduct(findByIdStmt.get(id));
}

function listByStatus(status, limit = 20) {
  return listByStatusStmt.all(status, limit).map(rowToProduct);
}

function setStatus(id, status) {
  setStatusStmt.run(status, id);
  return findById(id);
}

function markPublished(id, messageId, chatId) {
  setPublishedInfoStmt.run(messageId, String(chatId), id);
  return findById(id);
}

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

module.exports = {
  create,
  update,
  findById,
  listByStatus,
  setStatus,
  markPublished,
  remove,
};
