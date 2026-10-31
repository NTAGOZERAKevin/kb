import xss from 'xss';

const blockedKeys = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeValue(value, fieldName = '', depth = 0) {
  if (depth > 10) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, fieldName, depth + 1));
  }

  if (value && typeof value === 'object') {
    const sanitizedObject = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (blockedKeys.has(key) || key.startsWith('$') || key.includes('.')) {
        continue;
      }

      sanitizedObject[key] = sanitizeValue(nestedValue, key, depth + 1);
    }

    return sanitizedObject;
  }

  if (typeof value === 'string') {
    if (/password/i.test(fieldName)) {
      return value.replace(/\0/g, '');
    }

    return xss(value).replace(/\0/g, '');
  }

  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
}
