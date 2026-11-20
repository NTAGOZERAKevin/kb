import { randomUUID } from 'node:crypto';
import { collection, sessionOptions } from '../config/db.js';
import { isUuid, mapDiscountCode } from '../db/rows.js';

const discountCodes = () => collection('discountCodes');

export function isExpired(expiresAt) {
  if (!expiresAt) {
    return false;
  }

  const time = new Date(expiresAt).getTime();

  return Number.isFinite(time) && time <= Date.now();
}

export function normalizeCode(code) {
  return String(code ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export const DiscountCode = {
  async list() {
    const documents = await discountCodes().find().sort({ createdAt: -1 }).toArray();
    return documents.map(mapDiscountCode);
  },

  async findById(id) {
    if (!isUuid(id)) {
      return null;
    }

    return mapDiscountCode(await discountCodes().findOne({ _id: id }));
  },

  async findByCode(code) {
    const normalized = normalizeCode(code);

    if (!normalized) {
      return null;
    }

    return mapDiscountCode(await discountCodes().findOne({ code: normalized }));
  },

  async findActiveByCode(code) {
    const document = await DiscountCode.findByCode(code);

    if (!document || !document.isActive || isExpired(document.expiresAt)) {
      return null;
    }

    return document;
  },

  async codeExists(code, exceptId) {
    const filter = { code: normalizeCode(code) };

    if (exceptId) {
      filter._id = { $ne: exceptId };
    }

    return Boolean(await discountCodes().findOne(filter, { projection: { _id: 1 } }));
  },

  async create(payload) {
    const now = new Date();
    const document = {
      _id: randomUUID(),
      code: normalizeCode(payload.code),
      description: payload.description || '',
      type: payload.type,
      value: payload.value,
      minSubtotal: payload.minSubtotal,
      maxUses: payload.maxUses,
      usedCount: 0,
      expiresAt: payload.expiresAt,
      isActive: payload.isActive,
      createdBy: payload.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await discountCodes().insertOne(document);

    return mapDiscountCode(document);
  },

  async update(id, updates) {
    if (!isUuid(id)) {
      return null;
    }

    const next = { ...updates, updatedAt: new Date() };

    if (next.code) {
      next.code = normalizeCode(next.code);
    }

    const updated = await discountCodes().findOneAndUpdate(
      { _id: id },
      { $set: next },
      { returnDocument: 'after' },
    );

    return mapDiscountCode(updated);
  },

  async remove(id) {
    if (!isUuid(id)) {
      return null;
    }

    return mapDiscountCode(await discountCodes().findOneAndDelete({ _id: id }));
  },

  async incrementUsage(id, client) {
    if (!isUuid(id)) {
      return;
    }

    await discountCodes().updateOne(
      { _id: id },
      { $inc: { usedCount: 1 }, $set: { updatedAt: new Date() } },
      sessionOptions(client),
    );
  },
};
