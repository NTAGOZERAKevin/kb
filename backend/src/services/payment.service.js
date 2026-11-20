import { randomBytes } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';
const STORE_NAME = 'Sharon Glow Boutique';

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
  pesapal: {
    label: 'Pesapal',
    prefix: 'PESAPAL',
    instructions:
      'You will be redirected to Pesapal to complete your purchase. Use the reference shown below if our team follows up by phone.',
  },
  card: {
    label: 'Card payment',
    prefix: 'CARD',
    instructions:
      'A secure card link will be sent to your email. Card processing activates once the payment gateway is connected.',
  },
  flutterwave: {
    label: 'Flutterwave',
    prefix: 'FLW',
    instructions:
      'You will be redirected to Flutterwave to pay with a card or mobile money. Your order is confirmed automatically once the payment succeeds.',
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

export function isFlutterwaveEnabled() {
  return env.flutterwave.isConfigured;
}

function flutterwaveReference() {
  return `FLW-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
}

function checkoutRedirectUrl(orderId) {
  const origin = env.clientUrls[0] || 'http://localhost:5173';

  return `${origin.replace(/\/$/, '')}/orders?payment=flutterwave&order=${encodeURIComponent(orderId)}`;
}

async function flutterwaveRequest(path, { method = 'GET', body, allowNotFound = false } = {}) {
  if (!env.flutterwave.isConfigured) {
    throw new ApiError(
      503,
      'Flutterwave is not configured yet. Add FLUTTERWAVE_SECRET_KEY to enable online payments.',
    );
  }

  let response;

  try {
    response = await fetch(`${FLUTTERWAVE_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.flutterwave.secretKey}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(502, 'We could not reach Flutterwave. Please try again.');
  }

  if (allowNotFound && response.status === 404) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === 'error') {
    throw new ApiError(
      502,
      payload?.message || 'Flutterwave could not process this payment request.',
    );
  }

  return payload;
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

  if (order.paymentMethod === 'flutterwave') {
    const reference = flutterwaveReference();
    const total = Math.max(1, Math.round(Number(order.total) || 0));

    const payload = await flutterwaveRequest('/payments', {
      method: 'POST',
      body: {
        tx_ref: reference,
        amount: total,
        currency: env.flutterwave.currency,
        redirect_url: checkoutRedirectUrl(order._id),
        customer: {
          email: order.customer?.email,
          phonenumber: order.customer?.phone,
          name: order.customer?.name,
        },
        customizations: {
          title: STORE_NAME,
          description: `Order ${order.orderNumber}`,
        },
        meta: { orderId: order._id, orderNumber: order.orderNumber },
      },
    });

    const checkoutUrl = payload?.data?.link;

    if (!checkoutUrl) {
      throw new ApiError(502, 'Flutterwave did not return a checkout link. Please try again.');
    }

    return {
      provider: provider.label,
      mode: 'live',
      reference,
      checkoutUrl,
      instructions: provider.instructions,
      status: 'pending',
    };
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

export async function verifyPayment(order) {
  if (order.paymentMethod !== 'flutterwave') {
    throw new ApiError(422, 'This order is not paid through Flutterwave');
  }

  if (!order.paymentReference) {
    throw new ApiError(409, 'This order has no Flutterwave payment reference yet');
  }

  const payload = await flutterwaveRequest(
    `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(order.paymentReference)}`,
    { allowNotFound: true },
  );

  const transaction = payload?.data;

  if (!transaction) {
    return { status: 'pending', transaction: null };
  }

  if (transaction.status !== 'successful') {
    return { status: 'failed', transaction };
  }

  const currency = String(transaction.currency || '').toUpperCase();

  if (currency !== env.flutterwave.currency.toUpperCase()) {
    throw new ApiError(422, 'The payment currency does not match this order');
  }

  if (Number(transaction.amount) + 0.01 < Number(order.total)) {
    throw new ApiError(422, 'The amount paid does not match this order total');
  }

  return { status: 'successful', transaction };
}
