import { PRODUCT_CATEGORIES } from '../data/categories.js';
import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(query.limit, 10) || 12));
  return { page, limit, offset: (page - 1) * limit };
}

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);

  const filters = {
    includeInactive: req.query.includeInactive === 'true' && req.user?.role === 'admin',
    category: req.query.category,
    featured: req.query.featured === 'true',
    search: req.query.q,
  };

  const sort = req.query.sort;

  const [items, total] = await Promise.all([
    Product.list({ ...filters, sort, limit, offset }),
    Product.count(filters),
  ]);

  res.json({
    success: true,
    data: {
      items,
      categories: PRODUCT_CATEGORIES,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdentifier(req.params.identifier);

  if (!product) {
    throw new ApiError(404, 'That product could not be found');
  }

  res.json({ success: true, data: { product } });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: { product } });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.update(req.params.id, req.body);

  if (!product) {
    throw new ApiError(404, 'That product could not be found');
  }

  res.json({ success: true, data: { product } });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.deactivate(req.params.id);

  if (!product) {
    throw new ApiError(404, 'That product could not be found');
  }

  res.json({ success: true, message: 'Product removed from the storefront' });
});

export const listReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.listByProduct(req.params.id, 50);

  res.json({ success: true, data: { reviews } });
});

export const upsertReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'That product could not be found');
  }

  const { rating, comment } = req.body;

  const review = await Review.upsert(product._id, req.user._id, { rating, comment });
  const stats = await Review.statsForProduct(product._id);
  await Product.setRating(product._id, stats);

  const updatedProduct = await Product.findById(product._id);

  res.status(201).json({ success: true, data: { review, product: updatedProduct } });
});
