'use strict';

class ValidationError extends Error {}

function validateProductName(text) {
  const value = (text || '').trim();
  if (!value) throw new ValidationError('Product name cannot be empty.');
  if (value.length > 120) throw new ValidationError('Product name is too long (max 120 characters).');
  return value;
}

function validateDescription(text) {
  const value = (text || '').trim();
  if (value.length > 800) throw new ValidationError('Description is too long (max 800 characters).');
  return value;
}

/**
 * Details are collected as free text, one line per bullet point.
 * Empty lines are dropped.
 */
function parseDetails(text) {
  const value = (text || '').trim();
  if (!value || /^skip$/i.test(value)) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 15); // sane upper bound so a post can't explode in length
}

function validatePrice(text) {
  const raw = (text || '').trim().replace(/,/g, '');
  const value = Number(raw);
  if (!raw || Number.isNaN(value)) {
    throw new ValidationError('Price must be a number, e.g. 25 or 25.99.');
  }
  if (value <= 0) {
    throw new ValidationError('Price must be greater than 0.');
  }
  if (value > 1_000_000) {
    throw new ValidationError('Price looks too large — please double check it.');
  }
  return Math.round(value * 100) / 100;
}

function validateCurrency(text) {
  const value = (text || 'USD').trim().toUpperCase();
  if (!/^[A-Z]{2,6}$/.test(value)) {
    throw new ValidationError('Currency should be a short code like USD, MMK, THB.');
  }
  return value;
}

module.exports = {
  ValidationError,
  validateProductName,
  validateDescription,
  parseDetails,
  validatePrice,
  validateCurrency,
};
