'use strict';

// Intentionally minimal (no external dependency). Swap this for pino/winston
// later if Drive X needs log shipping — every call site already goes through
// this module, so that would be a one-file change.

function timestamp() {
  return new Date().toISOString();
}

function serializeMeta(meta) {
  if (!meta) return '';
  try {
    return ' ' + JSON.stringify(meta);
  } catch {
    return '';
  }
}

module.exports = {
  info(message, meta) {
    console.log(`[${timestamp()}] [INFO] ${message}${serializeMeta(meta)}`);
  },
  warn(message, meta) {
    console.warn(`[${timestamp()}] [WARN] ${message}${serializeMeta(meta)}`);
  },
  error(message, err, meta) {
    console.error(`[${timestamp()}] [ERROR] ${message}${serializeMeta(meta)}`);
    if (err && err.stack) {
      console.error(err.stack);
    } else if (err) {
      console.error(err);
    }
  },
};
