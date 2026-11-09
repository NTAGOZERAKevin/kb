import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { isUuid, mapReview } from '../db/rows.js';

export const Review = {
  async listByProduct(productId, limit = 50) {
    if (!isUuid(productId)) {
      return [];
    }

    const { rows } = await query(
      `select r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
              u.name as user_name
       from reviews r
       join users u on u.id = r.user_id
       where r.product_id = $1
       order by r.created_at desc
       limit $2`,
      [productId, limit],
    );

    return rows.map(mapReview);
  },

  async upsert(productId, userId, { rating, comment }) {
    const { rows } = await query(
      `insert into reviews (id, product_id, user_id, rating, comment)
       values ($1, $2, $3, $4, $5)
       on conflict (product_id, user_id)
       do update set rating = excluded.rating, comment = excluded.comment, updated_at = now()
       returning id, product_id, user_id, rating, comment, created_at, updated_at,
                 (select name from users where id = $3) as user_name`,
      [randomUUID(), productId, userId, rating, comment],
    );

    return mapReview(rows[0]);
  },

  async statsForProduct(productId) {
    if (!isUuid(productId)) {
      return { rating: 0, reviewCount: 0 };
    }

    const { rows } = await query(
      `select coalesce(avg(rating), 0) as rating, count(*)::int as review_count
       from reviews where product_id = $1`,
      [productId],
    );

    return {
      rating: Math.round(Number(rows[0].rating) * 10) / 10,
      reviewCount: rows[0].review_count,
    };
  },
};
