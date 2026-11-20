import { env } from '../config/env.js';
import { Order } from '../models/order.model.js';
import { notifyPaymentConfirmed } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const flutterwaveWebhook = asyncHandler(async (req, res) => {
  const signature = req.get('verif-hash');

  if (!env.flutterwave.webhookHash || signature !== env.flutterwave.webhookHash) {
    throw new ApiError(401, 'Invalid Flutterwave webhook signature');
  }

  const { event, data } = req.body ?? {};

  // Flutterwave expects a 2xx for every accepted delivery. Anything else is retried.
  if (event !== 'charge.completed' || data?.status !== 'successful') {
    return res.json({ success: true });
  }

  const order = await Order.findByPaymentReference(data.tx_ref);

  if (!order || order.paymentStatus === 'paid') {
    return res.json({ success: true });
  }

  const currency = String(data.currency || '').toUpperCase();
  const amountMatches = Number(data.amount) + 0.01 >= Number(order.total);

  if (
    order.paymentMethod !== 'flutterwave' ||
    currency !== env.flutterwave.currency.toUpperCase() ||
    !amountMatches
  ) {
    console.warn('Flutterwave webhook ignored for order', order.orderNumber, {
      amount: data.amount,
      currency: data.currency,
    });
    return res.json({ success: true });
  }

  const updatedOrder = await Order.confirmPayment(order._id, { reference: data.tx_ref });

  notifyPaymentConfirmed(updatedOrder).catch((error) => {
    console.error('Failed to send payment notification', error);
  });

  res.json({ success: true });
});
