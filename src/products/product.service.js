'use strict';

const productRepository = require('../database/repositories/productRepository');
const { ProductStatus } = require('./product.model');
const {
  validateProductName,
  validateDescription,
  validatePrice,
  validateCurrency,
} = require('../utils/validators');

function createDraft(draftData, createdBy) {
  const product = {
    name: validateProductName(draftData.name),
    description: draftData.description ? validateDescription(draftData.description) : null,
    category: draftData.category || null,
    details: draftData.details || [],
    price: validatePrice(String(draftData.price)),
    currency: validateCurrency(draftData.currency || 'USD'),
    imageFileId: draftData.imageFileId || null,
    status: ProductStatus.DRAFT,
    createdBy,
  };
  return productRepository.create(product);
}

function updateDraft(id, draftData) {
  const existing = productRepository.findById(id);
  if (!existing) throw new Error(`Product #${id} not found.`);

  const product = {
    name: validateProductName(draftData.name),
    description: draftData.description ? validateDescription(draftData.description) : null,
    category: draftData.category || null,
    details: draftData.details || [],
    price: validatePrice(String(draftData.price)),
    currency: validateCurrency(draftData.currency || 'USD'),
    imageFileId: draftData.imageFileId || existing.imageFileId,
  };
  return productRepository.update(id, product);
}

function getById(id) {
  return productRepository.findById(id);
}

function listDrafts(limit = 10) {
  return productRepository.listByStatus(ProductStatus.DRAFT, limit);
}

function listPublished(limit = 10) {
  return productRepository.listByStatus(ProductStatus.PUBLISHED, limit);
}

function markPublished(id, messageId, chatId) {
  return productRepository.markPublished(id, messageId, chatId);
}

function archive(id) {
  return productRepository.setStatus(id, ProductStatus.ARCHIVED);
}

function remove(id) {
  return productRepository.remove(id);
}

module.exports = {
  createDraft,
  updateDraft,
  getById,
  listDrafts,
  listPublished,
  markPublished,
  archive,
  remove,
};
