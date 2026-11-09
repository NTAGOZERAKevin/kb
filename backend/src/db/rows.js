// Row mappers keep the JSON contract the frontend already consumes: `_id`
// string ids, camelCase fields, and numbers instead of Postgres numeric strings.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function toNumber(value) {
  return value === null || value === undefined ? undefined : Number(value);
}

export function mapUser(row, { includePassword = false } = {}) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    ...(includePassword ? { password: row.password } : {}),
    role: row.role,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.address ? { address: row.address } : {}),
    isActive: row.is_active,
    ...(row.last_login ? { lastLogin: row.last_login } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserRef(row) {
  // Only joined queries provide user_name; plain selects keep `user` as an id.
  if (!row?.user_id || row.user_name === undefined) {
    return undefined;
  }

  return {
    _id: row.user_id,
    name: row.user_name,
    email: row.user_email,
    ...(row.user_phone ? { phone: row.user_phone } : {}),
  };
}

export function mapProduct(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    benefits: row.benefits ?? [],
    price: Number(row.price),
    ...(row.compare_at_price === null || row.compare_at_price === undefined
      ? {}
      : { compareAtPrice: Number(row.compare_at_price) }),
    image: row.image,
    images: row.images ?? [],
    stock: row.stock,
    ...(row.tag ? { tag: row.tag } : {}),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    inStock: row.stock > 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrder(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    orderNumber: row.order_number,
    user: mapUserRef(row) ?? row.user_id,
    items: row.items ?? [],
    customer: row.customer,
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    ...(row.payment_reference ? { paymentReference: row.payment_reference } : {}),
    ...(row.paid_at ? { paidAt: row.paid_at } : {}),
    status: row.status,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    ...(row.notes ? { notes: row.notes } : {}),
    statusHistory: row.status_history ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReview(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    product: row.product_id,
    user: row.user_name ? { _id: row.user_id, name: row.user_name } : row.user_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotification(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    ...(row.order_id ? { order: row.order_id } : {}),
    ...(row.customer_id ? { customer: row.customer_id } : {}),
    channels: row.channels ?? [],
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
