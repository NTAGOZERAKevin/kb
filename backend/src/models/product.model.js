import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { isUuid, mapProduct } from '../db/rows.js';

export const PRODUCT_COLUMNS =
  'id, name, slug, category, description, benefits, price, compare_at_price, image, images, ' +
  'stock, tag, rating, review_count, is_featured, is_active, created_at, updated_at';

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

const sortClauses = {
  newest: 'created_at desc',
  oldest: 'created_at asc',
  'price-asc': 'price asc',
  'price-desc': 'price desc',
  rating: 'rating desc, review_count desc',
  name: 'name asc',
};

function productFilter({ category, featured, includeInactive, search } = {}) {
  const conditions = [];
  const params = [];

  if (!includeInactive) {
    conditions.push('is_active = true');
  }

  if (category && category !== 'all') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (featured) {
    conditions.push('is_featured = true');
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    params.push(`%${term}%`);
    const index = params.length;
    conditions.push(`(name ilike $${index} or description ilike $${index} or category ilike $${index})`);
  }

  return {
    clause: conditions.length > 0 ? conditions.join(' and ') : 'true',
    params,
  };
}

export const Product = {
  slugify: buildProductSlug,

  async list({
    category,
    featured,
    includeInactive,
    search,
    sort = 'newest',
    limit,
    offset,
  }) {
    const { clause, params } = productFilter({ category, featured, includeInactive, search });
    const limitIndex = params.length + 1;
    const orderBy = sortClauses[sort] || sortClauses.newest;

    const { rows } = await query(
      `select ${PRODUCT_COLUMNS} from products
       where ${clause}
       order by ${orderBy}
       limit $${limitIndex} offset $${limitIndex + 1}`,
      [...params, limit, offset],
    );

    return rows.map(mapProduct);
  },

  async count({ category, featured, includeInactive, search } = {}) {
    const { clause, params } = productFilter({ category, featured, includeInactive, search });
    const { rows } = await query(`select count(*)::int as total from products where ${clause}`, params);
    return rows[0].total;
  },

  async countActive() {
    const { rows } = await query(
      'select count(*)::int as total from products where is_active = true',
    );
    return rows[0].total;
  },

  async findById(id, client) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `select ${PRODUCT_COLUMNS} from products where id = $1`,
      [id],
      client,
    );

    return mapProduct(rows[0]);
  },

  async findByName(name) {
    const { rows } = await query(`select ${PRODUCT_COLUMNS} from products where name = $1 limit 1`, [
      String(name ?? '').trim(),
    ]);

    return mapProduct(rows[0]);
  },

  async findByIdentifier(identifier) {
    const { rows } = await query(
      `select ${PRODUCT_COLUMNS} from products where ${isUuid(identifier) ? 'id = $1' : 'slug = $1'}`,
      [isUuid(identifier) ? identifier : String(identifier).toLowerCase()],
    );

    return mapProduct(rows[0]);
  },

  async findManyByIds(ids, { onlyActive = true, client } = {}) {
    const uniqueIds = [...new Set(ids.filter((id) => isUuid(id)))];

    if (uniqueIds.length === 0) {
      return [];
    }

    const { rows } = await query(
      `select ${PRODUCT_COLUMNS} from products
       where id = any($1::uuid[])${onlyActive ? ' and is_active = true' : ''}`,
      [uniqueIds],
      client,
    );

    return rows.map(mapProduct);
  },

  async create(input) {
    const { rows } = await query(
      `insert into products (id, name, slug, category, description, benefits, price,
                             compare_at_price, image, images, stock, tag, rating, review_count,
                             is_featured, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       returning ${PRODUCT_COLUMNS}`,
      [
        randomUUID(),
        input.name,
        buildProductSlug(input.slug || input.name),
        input.category,
        input.description,
        JSON.stringify(input.benefits ?? []),
        input.price,
        input.compareAtPrice ?? null,
        input.image,
        JSON.stringify(input.images ?? []),
        input.stock ?? 0,
        input.tag || null,
        input.rating ?? 0,
        input.reviewCount ?? 0,
        input.isFeatured ?? false,
        input.isActive ?? true,
      ],
    );

    return mapProduct(rows[0]);
  },

  async update(id, input) {
    if (!isUuid(id)) {
      return null;
    }

    const existing = await Product.findById(id);

    if (!existing) {
      return null;
    }

    const next = { ...existing, ...input };

    const { rows } = await query(
      `update products set
         name = $2,
         slug = $3,
         category = $4,
         description = $5,
         benefits = $6,
         price = $7,
         compare_at_price = $8,
         image = $9,
         images = $10,
         stock = $11,
         tag = $12,
         rating = $13,
         review_count = $14,
         is_featured = $15,
         is_active = $16,
         updated_at = now()
       where id = $1
       returning ${PRODUCT_COLUMNS}`,
      [
        id,
        next.name,
        buildProductSlug(input.slug || existing.slug || next.name),
        next.category,
        next.description,
        JSON.stringify(next.benefits ?? []),
        next.price,
        next.compareAtPrice ?? null,
        next.image,
        JSON.stringify(next.images ?? []),
        next.stock ?? 0,
        next.tag || null,
        next.rating ?? 0,
        next.reviewCount ?? 0,
        next.isFeatured ?? false,
        next.isActive ?? true,
      ],
    );

    return mapProduct(rows[0]);
  },

  async deactivate(id) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `update products set is_active = false, updated_at = now()
       where id = $1
       returning ${PRODUCT_COLUMNS}`,
      [id],
    );

    return mapProduct(rows[0]);
  },

  async decrementStock(id, quantity, client) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `update products set stock = stock - $2, updated_at = now()
       where id = $1 and stock >= $2
       returning stock`,
      [id, quantity],
      client,
    );

    return rows[0] ? rows[0].stock : null;
  },

  async incrementStock(id, quantity, client) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `update products set stock = stock + $2, updated_at = now()
       where id = $1
       returning stock`,
      [id, quantity],
      client,
    );

    return rows[0] ? rows[0].stock : null;
  },

  async setRating(id, { rating, reviewCount }) {
    await query('update products set rating = $2, review_count = $3, updated_at = now() where id = $1', [
      id,
      rating,
      reviewCount,
    ]);
  },

  async lowStock(limit = 5) {
    const { rows } = await query(
      `select id, name, stock, image, category from products
       where is_active = true and stock <= 5
       order by stock asc
       limit $1`,
      [limit],
    );

    return rows.map((row) => ({
      _id: row.id,
      name: row.name,
      stock: row.stock,
      image: row.image,
      category: row.category,
    }));
  },
};
