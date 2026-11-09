import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { Notification } from '../models/notification.model.js';

const currency = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0,
});

let transporter;

function getTransporter() {
  if (!env.smtp.host) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
    });
  }

  return transporter;
}

async function deliverEmail(to, subject, text) {
  const mailer = getTransporter();

  if (!mailer || !to) {
    return false;
  }

  await mailer.sendMail({
    from: env.smtp.from || env.adminEmail,
    to,
    subject,
    text,
  });

  return true;
}

async function deliverWebhook(payload) {
  if (!env.notificationWebhookUrl) {
    return false;
  }

  const response = await fetch(env.notificationWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Notification webhook responded with ${response.status}`);
  }

  return true;
}

export async function sendNotification({
  type,
  title,
  message,
  order,
  customer,
  emailSubject,
  emailText,
  customerEmail,
  webhookPayload,
}) {
  const channels = [];

  try {
    if (await deliverEmail(env.adminEmail, emailSubject || title, emailText || message)) {
      channels.push('email_admin');
    }
  } catch (error) {
    console.error('Failed to send admin notification email', error);
  }

  try {
    if (
      customerEmail &&
      (await deliverEmail(customerEmail, emailSubject || title, emailText || message))
    ) {
      channels.push('email_customer');
    }
  } catch (error) {
    console.error('Failed to send customer notification email', error);
  }

  try {
    if (await deliverWebhook(webhookPayload || { type, title, message })) {
      channels.push('webhook');
    }
  } catch (error) {
    console.error('Failed to send notification webhook', error);
  }

  try {
    await Notification.create({
      type,
      title,
      message,
      order,
      customer,
      channels,
    });
    channels.push('in_app');
  } catch (error) {
    console.error('Failed to store notification', error);
  }

  return channels;
}

export async function notifyNewOrder(order) {
  const total = currency.format(order.total);

  return sendNotification({
    type: 'order_placed',
    title: `New order ${order.orderNumber}`,
    message: `${order.customer.name} placed an order worth ${total}.`,
    order: order._id,
    customer: order.user,
    emailSubject: `New order ${order.orderNumber} — ${total}`,
    emailText: [
      `A new order has been placed.`,
      ``,
      `Order: ${order.orderNumber}`,
      `Customer: ${order.customer.name}`,
      `Phone: ${order.customer.phone || 'not provided'}`,
      `Email: ${order.customer.email}`,
      `Total: ${total}`,
      `Payment: ${order.paymentMethod.replaceAll('_', ' ')}`,
      `Deliver to: ${order.shippingAddress.street}, ${order.shippingAddress.city}`,
    ].join('\n'),
    customerEmail: order.customer.email,
    webhookPayload: {
      event: 'order_placed',
      orderNumber: order.orderNumber,
      customer: order.customer,
      total: order.total,
      items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
    },
  });
}

export async function notifyOrderStatus(order, status) {
  return sendNotification({
    type: 'order_status',
    title: `Order ${order.orderNumber} is ${status}`,
    message: `The order for ${order.customer.name} was marked as ${status}.`,
    order: order._id,
    customer: order.user,
    emailSubject: `Your Beauty Oil Market order is ${status}`,
    emailText: [
      `Hello ${order.customer.name},`,
      ``,
      `Your order ${order.orderNumber} is now ${status}.`,
      `Total: ${currency.format(order.total)}`,
      ``,
      `Thank you for choosing Beauty Oil Market.`,
    ].join('\n'),
    customerEmail: order.customer.email,
    webhookPayload: {
      event: 'order_status',
      orderNumber: order.orderNumber,
      status,
      customer: order.customer,
    },
  });
}

export async function notifyPaymentConfirmed(order) {
  return sendNotification({
    type: 'payment',
    title: `Payment received for ${order.orderNumber}`,
    message: `${currency.format(order.total)} was confirmed for ${order.customer.name}.`,
    order: order._id,
    customer: order.user,
    emailSubject: `Payment confirmed for ${order.orderNumber}`,
    emailText: [
      `Hello ${order.customer.name},`,
      ``,
      `We have confirmed your payment of ${currency.format(order.total)}.`,
      `Your order ${order.orderNumber} is now confirmed and being prepared.`,
      `Reference: ${order.paymentReference || 'N/A'}`,
    ].join('\n'),
    customerEmail: order.customer.email,
    webhookPayload: {
      event: 'payment_confirmed',
      orderNumber: order.orderNumber,
      total: order.total,
      reference: order.paymentReference,
    },
  });
}
