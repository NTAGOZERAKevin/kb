import { withTransaction } from '../config/db.js';
import { Order, ORDER_STATUSES } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { recordActivity } from '../services/activityLog.service.js';
import {
  notifyNewOrder,
  notifyOrderStatus,
  notifyPaymentConfirmed,
} from '../services/notification.service.js';
import { initiatePayment } from '../services/payment.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const FREE_DELIVERY_THRESHOLD = 50000;
const DELIVERY_FEE = 3000;

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

function ownerId(order) {
  return typeof order.user === 'object' && order.user !== null ? order.user._id : order.user;
}

function isOwner(order, user) {
  return ownerId(order) === user._id;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingAddress, paymentMethod, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(422, 'Your cart is empty');
  }

  const productIds = items.map((item) => item.product);
  const products = await Product.findManyByIds(productIds);
  const productMap = new Map(products.map((product) => [product._id, product]));

  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(String(item.product));
    const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);

    if (!product) {
      throw new ApiError(404, 'One of the products in your cart is no longer available');
    }

    if (product.stock < quantity) {
      throw new ApiError(
        409,
        `Only ${product.stock} of ${product.name} left in stock. Please update your cart.`,
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const order = await withTransaction(async (client) => {
    for (const item of orderItems) {
      const remaining = await Product.decrementStock(item.product, item.quantity, client);

      if (remaining === null) {
        const current = await Product.findById(item.product, client);
        throw new ApiError(
          409,
          current
            ? `Only ${current.stock} of ${item.name} left in stock. Please update your cart.`
            : 'One of the products in your cart is no longer available',
        );
      }
    }

    return Order.create(
      {
        userId: req.user._id,
        items: orderItems,
        customer: {
          name: customer?.name || req.user.name,
          email: customer?.email || req.user.email,
          phone: customer?.phone || req.user.phone,
        },
        shippingAddress,
        paymentMethod: paymentMethod || 'mtn_momo',
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        notes,
      },
      client,
    );
  });

  await recordActivity({
    userId: req.user._id,
    action: 'order.created',
    req,
    metadata: { orderNumber: order.orderNumber, total: order.total },
  });

  notifyNewOrder(order).catch((error) => {
    console.error('Failed to send new order notification', error);
  });

  res.status(201).json({
    success: true,
    message: 'Your order has been placed',
    data: { order },
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.listByUser(req.user._id, 50);
  res.json({ success: true, data: { orders } });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id, { withUser: true });

  if (!order) {
    throw new ApiError(404, 'That order could not be found');
  }

  if (!isOwner(order, req.user) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to view this order');
  }

  res.json({ success: true, data: { order } });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = { status: req.query.status, search: req.query.q };

  const [orders, total] = await Promise.all([
    Order.list({ ...filters, limit, offset }),
    Order.count(filters),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(422, 'That order status is not valid');
  }

  const existing = await Order.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'That order could not be found');
  }

  const wasCancelled = existing.status === 'cancelled';
  const shouldRestoreStock = status === 'cancelled' && !wasCancelled;

  const order = await withTransaction(async (client) => {
    if (shouldRestoreStock) {
      for (const item of existing.items) {
        await Product.incrementStock(item.product, item.quantity, client);
      }
    }

    return Order.updateStatus(
      existing._id,
      {
        status,
        note,
        ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      },
      client,
    );
  });

  await recordActivity({
    userId: req.user._id,
    action: 'order.status_updated',
    req,
    metadata: { orderNumber: order.orderNumber, status },
  });

  notifyOrderStatus(order, status).catch((error) => {
    console.error('Failed to send order status notification', error);
  });

  res.json({ success: true, message: 'Order updated', data: { order } });
});

export const initiateOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'That order could not be found');
  }

  if (!isOwner(order, req.user) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to pay for this order');
  }

  const payment = await initiatePayment(order);
  const updatedOrder = await Order.setPaymentReference(order._id, payment.reference);

  res.json({
    success: true,
    message: 'Payment initiated',
    data: { order: updatedOrder, payment },
  });
});

export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'That order could not be found');
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(409, 'This order has already been paid');
  }

  const updatedOrder = await Order.confirmPayment(order._id, {
    reference: `MANUAL-${order.orderNumber}`,
  });

  await recordActivity({
    userId: req.user._id,
    action: 'order.payment_confirmed',
    req,
    metadata: { orderNumber: order.orderNumber, total: order.total },
  });

  notifyPaymentConfirmed(updatedOrder).catch((error) => {
    console.error('Failed to send payment notification', error);
  });

  res.json({ success: true, message: 'Payment confirmed', data: { order: updatedOrder } });
});
