import { siteConfig } from '../config/site.js';

const formatter = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount) {
  return formatter.format(amount);
}
