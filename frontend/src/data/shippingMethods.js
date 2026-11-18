export const FREE_DELIVERY_THRESHOLD = 50000;

export const SHIPPING_METHODS = [
  {
    value: 'same_day',
    label: 'Same Day Delivery',
    areas: 'Kigali city centre and nearby neighbourhoods',
    eta: '2–3 hours',
    fee: 2000,
  },
  {
    value: 'uptown',
    label: 'Uptown Delivery',
    areas: 'Rusororo, Gahanga, Kwa Mushimire and more',
    eta: '1 business day',
    fee: 2800,
  },
  {
    value: 'express',
    label: 'Express Delivery',
    areas: 'Priority rider, not more than 4 items',
    eta: 'Within 1 hour',
    fee: 3000,
  },
  {
    value: 'up_country',
    label: 'Up-Country',
    areas: 'Rubavu, Huye, Rusizi, Musanze and more',
    eta: '1–2 business days',
    fee: 3000,
  },
  {
    value: 'deluxe',
    label: 'Deluxe Delivery',
    areas: 'Delivered by private car',
    eta: '1 business day',
    fee: 15000,
  },
];

export function shippingMethodLabel(value) {
  const known = SHIPPING_METHODS.find((method) => method.value === value)?.label;

  if (known) {
    return known;
  }

  return String(value || 'standard')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
