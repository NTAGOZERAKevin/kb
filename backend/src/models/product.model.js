import { randomUUID } from 'node:crypto';
import { collection, sessionOptions } from '../config/db.js';
import { isUuid, mapProduct } from '../db/rows.js';

function products() {
  return collection('products');
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildProductSlug(name) {
  return slugify(name);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const sortClauses = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, reviewCount: -1 },
  name: { name: 1 },
};

function productFilter({ category, featured, includeInactive, search } = {}) {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (featured) {
    filter.isFeatured = true;
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    const pattern = { $regex: escapeRegExp(term), $options: 'i' };
    filter.$or = [{ name: pattern }, { description: pattern }, { category: pattern }];
  }

  return filter;
}

export const Product = {
  slugify: buildProductSlug,

  async list({ category, featured, includeInactive, search, sort = 'newest', limit, offset }) {
    const documents = await products()
      .find(productFilter({ category, featured, includeInactive, search }))
      .sort(sortClauses[sort] || sortClauses.newest)
      .skip(offset)
      .limit(limit)
      .toArray();

    return documents.map(mapProduct);
  },

  async count({ category, featured, includeInactive, search } = {}) {
    return products().countDocuments(productFilter({ category, featured, includeInactive, search }));
  },

  async countActive() {
    return products().countDocuments({ isActive: true });
  },

  async findById(id, client) {
    if (!isUuid(id)) {
      return null;
    }

    const document = await products().findOne({ _id: id }, sessionOptions(client));

    return mapProduct(document);
  },

  async findByName(name) {
    const document = await products().findOne({ name: String(name ?? '').trim() });

    return mapProduct(document);
  },

  async findByIdentifier(identifier) {
    const filter = isUuid(identifier)
      ? { _id: identifier }
      : { slug: String(identifier).toLowerCase() };

    const document = await products().findOne(filter);

    return mapProduct(document);
  },

  async findManyByIds(ids, { onlyActive = true, client } = {}) {
    const uniqueIds = [...new Set(ids.filter((id) => isUuid(id)))];

    if (uniqueIds.length === 0) {
      return [];
    }

    const filter = { _id: { $in: uniqueIds }, ...(onlyActive ? { isActive: true } : {}) };
    const documents = await products().find(filter, sessionOptions(client)).toArray();

    return documents.map(mapProduct);
  },

  async create(input) {
    const now = new Date();
    const document = {
      _id: randomUUID(),
      name: input.name,
      slug: buildProductSlug(input.slug || input.name),
      category: input.category,
      description: input.description,
      benefits: input.benefits ?? [],
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      image: input.image,
      images: input.images ?? [],
      stock: input.stock ?? 0,
      tag: input.tag || null,
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      isFeatured: input.isFeatured ?? false,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    await products().insertOne(document);

    return mapProduct(document);
  },

  async update(id, input) {
    if (!isUuid(id)) {
      return null;
    }

    const existing = await products().findOne({ _id: id });

    if (!existing) {
      return null;
    }

    const next = { ...existing, ...input };

    const updated = await products().findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name: next.name,
          slug: buildProductSlug(input.slug || existing.slug || next.name),
          category: next.category,
          description: next.description,
          benefits: next.benefits ?? [],
          price: next.price,
          compareAtPrice: next.compareAtPrice ?? null,
          image: next.image,
          images: next.images ?? [],
          stock: next.stock ?? 0,
          tag: next.tag || null,
          rating: next.rating ?? 0,
          reviewCount: next.reviewCount ?? 0,
          isFeatured: next.isFeatured ?? false,
          isActive: next.isActive ?? true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return mapProduct(updated);
  },

  async deactivate(id) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await products().findOneAndUpdate(
      { _id: id },
      { $set: { isActive: false, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return mapProduct(updated);
  },

  async decrementStock(id, quantity, client) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await products().findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity }, $set: { updatedAt: new Date() } },
      { ...sessionOptions(client), returnDocument: 'after' },
    );

    return updated ? updated.stock : null;
  },

  async incrementStock(id, quantity, client) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await products().findOneAndUpdate(
      { _id: id },
      { $inc: { stock: quantity }, $set: { updatedAt: new Date() } },
      { ...sessionOptions(client), returnDocument: 'after' },
    );

    return updated ? updated.stock : null;
  },

  async setRating(id, { rating, reviewCount }) {
    await products().updateOne(
      { _id: id },
      { $set: { rating, reviewCount, updatedAt: new Date() } },
    );
  },

  async lowStock(limit = 5) {
    const documents = await products()
      .find({ isActive: true, stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(limit)
      .toArray();

    return documents.map((document) => ({
      _id: document._id,
      name: document.name,
      stock: document.stock,
      image: document.image,
      category: document.category,
    }));
  },
};
