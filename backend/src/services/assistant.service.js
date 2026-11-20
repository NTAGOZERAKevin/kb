import { env } from '../config/env.js';
import { DeliveryZone } from '../models/delivery.model.js';
import { Product } from '../models/product.model.js';
import { isFlutterwaveEnabled } from './payment.service.js';
import { ApiError } from '../utils/ApiError.js';

const STORE = {
  name: 'Sharon Glow Boutique',
  tagline: 'Nourish your natural glow.',
  location: 'Kigali, Rwanda',
  address: 'KN 82 St, Downtown Kigali, Rwanda',
  email: 'hello@sharonglowboutique.com',
  phone: '+250 780 427 117',
  currency: 'RWF',
  freeDeliveryThreshold: 50000,
};

const MAX_MESSAGES = 8;
const MAX_CHARACTERS = 800;

function formatPrice(amount) {
  return `${new Intl.NumberFormat('en-RW').format(Number(amount) || 0)} ${STORE.currency}`;
}

function productLines(products) {
  if (products.length === 0) {
    return '- The catalogue is being restocked right now.';
  }

  return products
    .map(
      (product) =>
        `- ${product.name} (${product.category}): ${formatPrice(product.price)}${
          product.inStock ? '' : ' — currently out of stock'
        }.${product.description ? ` ${product.description}` : ''}`,
    )
    .join('\n');
}

function deliveryLines(zones) {
  if (zones.length === 0) {
    return '- Delivery options are shown at checkout.';
  }

  return zones
    .map(
      (zone) =>
        `- ${zone.label}: covers ${zone.areas || 'selected areas'}, ${zone.eta || 'timing confirmed at checkout'}, ${formatPrice(zone.fee)}.`,
    )
    .join('\n');
}

function paymentLines() {
  const methods = [
    'MTN MoMo',
    'Airtel Money',
    'Card payment (a secure link is emailed after checkout)',
    'Cash on delivery',
  ];

  if (isFlutterwaveEnabled()) {
    methods.push('Flutterwave (card or mobile money, confirmed automatically)');
  }

  return methods.map((method) => `- ${method}`).join('\n');
}

function systemPrompt({ products, zones }) {
  return `You are the shopping assistant for ${STORE.name}, a small-batch beauty oil boutique in ${STORE.location}.

How to answer:
- Be warm, brief and practical. Two to four short sentences, or a short list when comparing options.
- Only use the shop facts below. Never invent products, prices, discounts, delivery fees, delivery times or policies.
- Prices are in ${STORE.currency}. Delivery is free for orders of ${formatPrice(STORE.freeDeliveryThreshold)} and above.
- When someone describes a skin, hair or scent preference, recommend one or two matching oils from the catalogue and briefly say why.
- For anything about a specific order (status, refund, wrong item), point them to the Orders page in their account, or to ${STORE.email} / ${STORE.phone}.
- You cannot place orders, change orders, apply discount codes or give medical advice. Say so plainly and offer the human contact instead.
- Discount codes are entered at checkout; if a code is rejected, suggest checking the spelling or its expiry date.
- If a question is unrelated to the shop, politely say you only help with ${STORE.name} orders, products and delivery.
- Do not use markdown headings. Plain sentences, or dash lines for lists.

Shop facts:
Name: ${STORE.name} — ${STORE.tagline}
Location: ${STORE.address}
Contact: ${STORE.email} | ${STORE.phone}
Currency: ${STORE.currency}
Today: ${new Date().toISOString().slice(0, 10)}

Catalogue:
${productLines(products)}

Delivery:
${deliveryLines(zones)}
Free delivery on orders of ${formatPrice(STORE.freeDeliveryThreshold)} or more.

Payment methods at checkout:
${paymentLines()}

How ordering works: browse the shop, add oils to the cart, create an account or sign in, fill in delivery details at checkout, choose a payment method, then place the order. Order status and history live on the Orders page.`;
}

async function shopFacts() {
  const [products, zones] = await Promise.all([
    Product.list({ limit: 40, offset: 0, sort: 'name' }),
    DeliveryZone.list(),
  ]);

  return { products, zones };
}

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new ApiError(422, 'Send at least one message');
  }

  const cleaned = messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? '')
        .trim()
        .slice(0, MAX_CHARACTERS),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_MESSAGES);

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
    throw new ApiError(422, 'Send a question for the assistant');
  }

  return cleaned;
}

export async function askAssistant(messages) {
  if (!env.assistant.isConfigured) {
    throw new ApiError(
      503,
      'Our assistant is taking a short break. Email hello@sharonglowboutique.com and we will help you right away.',
    );
  }

  const facts = await shopFacts();

  let response;

  try {
    response = await fetch(`${env.assistant.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.assistant.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.assistant.model,
        temperature: 0.3,
        max_tokens: 400,
        messages: [{ role: 'system', content: systemPrompt(facts) }, ...messages],
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new ApiError(502, 'Our assistant could not answer just now. Please try again.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(
      'Assistant provider error:',
      response.status,
      payload?.error?.message || payload?.message || 'unknown error',
    );

    throw new ApiError(502, 'Our assistant could not answer just now. Please try again.');
  }

  const reply = payload?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new ApiError(502, 'Our assistant could not answer just now. Please try again.');
  }

  return { reply };
}
