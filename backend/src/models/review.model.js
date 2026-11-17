import { randomUUID } from 'node:crypto';
import { collection } from '../config/db.js';
import { isUuid, mapReview } from '../db/rows.js';

function reviews() {
  return collection('reviews');
}

export const Review = {
  async listByProduct(productId, limit = 50) {
    if (!isUuid(productId)) {
      return [];
    }

    const documents = await reviews()
      .find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const userIds = [...new Set(documents.map((document) => document.user))];
    const users =
      userIds.length > 0
        ? await collection('users')
            .find({ _id: { $in: userIds } })
            .project({ name: 1 })
            .toArray()
        : [];
    const namesById = new Map(users.map((user) => [user._id, user.name]));

    return documents.map((document) =>
      mapReview(document, { userName: namesById.get(document.user) }),
    );
  },

  async upsert(productId, userId, { rating, comment }) {
    const now = new Date();

    const document = await reviews().findOneAndUpdate(
      { product: productId, user: userId },
      {
        $set: { rating, comment, updatedAt: now },
        $setOnInsert: { _id: randomUUID(), createdAt: now },
      },
      { upsert: true, returnDocument: 'after' },
    );

    const user = await collection('users').findOne({ _id: userId }, { projection: { name: 1 } });

    return mapReview(document, { userName: user?.name });
  },

  async statsForProduct(productId) {
    if (!isUuid(productId)) {
      return { rating: 0, reviewCount: 0 };
    }

    const [stats] = await reviews()
      .aggregate([
        { $match: { product: productId } },
        { $group: { _id: null, rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
      ])
      .toArray();

    return {
      rating: Math.round(Number(stats?.rating ?? 0) * 10) / 10,
      reviewCount: stats?.reviewCount ?? 0,
    };
  },
};
