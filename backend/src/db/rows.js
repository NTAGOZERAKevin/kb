// Document mappers keep the JSON contract the frontend already consumes:
// `_id` string ids, camelCase fields, and numbers for prices.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function toNumber(value) {
  return value === null || value === undefined ? undefined : Number(value);
}

export function mapUser(document, { includePassword = false } = {}) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    name: document.name,
    email: document.email,
    ...(includePassword ? { password: document.password } : {}),
    role: document.role,
    ...(document.phone ? { phone: document.phone } : {}),
    ...(document.address ? { address: document.address } : {}),
    isActive: document.isActive,
    ...(document.lastLogin ? { lastLogin: document.lastLogin } : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapUserRef(user) {
  if (!user) {
    return undefined;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    ...(user.phone ? { phone: user.phone } : {}),
  };
}

export function mapProduct(document) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    name: document.name,
    slug: document.slug,
    category: document.category,
    description: document.description,
    benefits: document.benefits ?? [],
    price: Number(document.price),
    ...(document.compareAtPrice === null || document.compareAtPrice === undefined
      ? {}
      : { compareAtPrice: Number(document.compareAtPrice) }),
    image: document.image,
    images: document.images ?? [],
    stock: document.stock,
    ...(document.tag ? { tag: document.tag } : {}),
    rating: Number(document.rating),
    reviewCount: document.reviewCount,
    isFeatured: document.isFeatured,
    isActive: document.isActive,
    inStock: document.stock > 0,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrder(document, { user } = {}) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    orderNumber: document.orderNumber,
    user: mapUserRef(user) ?? document.user ?? null,
    items: document.items ?? [],
    customer: document.customer,
    shippingAddress: document.shippingAddress,
    paymentMethod: document.paymentMethod,
    paymentStatus: document.paymentStatus,
    ...(document.paymentReference ? { paymentReference: document.paymentReference } : {}),
    ...(document.paidAt ? { paidAt: document.paidAt } : {}),
    status: document.status,
    subtotal: Number(document.subtotal),
    deliveryFee: Number(document.deliveryFee),
    total: Number(document.total),
    ...(document.notes ? { notes: document.notes } : {}),
    statusHistory: document.statusHistory ?? [],
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapReview(document, { userName } = {}) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    product: document.product,
    user: userName ? { _id: document.user, name: userName } : document.user,
    rating: document.rating,
    comment: document.comment,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapNotification(document) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    type: document.type,
    title: document.title,
    message: document.message,
    ...(document.order ? { order: document.order } : {}),
    ...(document.customer ? { customer: document.customer } : {}),
    channels: document.channels ?? [],
    isRead: document.isRead,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
