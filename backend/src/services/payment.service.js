import { randomBytes } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const providers = {
  mtn_momo: {
    label: 'MTN MoMo',
    prefix: 'MOMO',
    instructions:
      'Open MTN MoMo, choose Payments, and enter the reference shown below. Our team confirms your payment shortly.',
  },
  airtel_money: {
    label: 'Airtel Money',
    prefix: 'AIRTEL',
    instructions:
      'Open Airtel Money, choose Pay Bill, and use the reference shown below. Our team confirms your payment shortly.',
  },
  card: {
    label: 'Card payment',
    prefix: 'CARD',
    instructions:
      'A secure card link will be sent to your email. Card processing activates once the payment gateway is connected.',
  },
  cash_on_delivery: {
    label: 'Cash on delivery',
    prefix: 'COD',
    instructions: 'Pay in cash when your oils are delivered to your door.',
  },
};

export function getPaymentProvider(method) {
  return providers[method] || providers.mtn_momo;
}

export async function initiatePayment(order) {
  const provider = getPaymentProvider(order.paymentMethod);

  if (order.paymentStatus === 'paid') {
    throw new ApiError(409, 'This order has already been paid');
  }

  if (order.status === 'cancelled') {
    throw new ApiError(409, 'This order was cancelled');
  }

  if (order.paymentMethod === 'cash_on_delivery') {
    throw new ApiError(422, 'Cash on delivery is paid when your order arrives');
  }

  if (env.paymentMode !== 'mock') {
    throw new ApiError(
      503,
      'Online payments are not configured yet. Add your payment provider credentials to enable this.',
    );
  }

  const reference = `${provider.prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

  return {
    provider: provider.label,
    mode: 'mock',
    reference,
    instructions: provider.instructions,
    status: 'pending',
  };
}
