import { Banknote, CreditCard, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { siteConfig } from '../config/site.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const MOMO_DIAL = '*182*8*1*007795#';
const MERCHANT_NUMBER = '0780 427 117';

const GUIDES = {
  mtn_momo: {
    title: 'How to pay with MTN MoMo',
    icon: Wallet,
    details: [
      { label: 'Dial', value: MOMO_DIAL, mono: true },
      { label: 'Reference', value: siteConfig.name },
      { label: 'MoMo number', value: MERCHANT_NUMBER, mono: true },
    ],
    steps: [
      `Dial ${MOMO_DIAL} on the MTN phone you are paying from.`,
      'Choose Pay with MoMo, then enter the amount shown above as your order total.',
      `Enter the reference “${siteConfig.name}”.`,
      `Confirm the payment to ${MERCHANT_NUMBER} and keep the confirmation SMS.`,
    ],
    note: 'Our team checks your payment and confirms the order before your oils are dispatched.',
  },
  airtel_money: {
    title: 'How to pay with Airtel Money',
    icon: Smartphone,
    details: [
      { label: 'Dial', value: '*500#', mono: true },
      { label: 'Reference', value: siteConfig.name },
      { label: 'Airtel number', value: MERCHANT_NUMBER, mono: true },
    ],
    steps: [
      'Dial *500# or open the Airtel Money app on your phone.',
      `Choose Send Money and enter ${MERCHANT_NUMBER}.`,
      'Enter the amount shown above as your order total.',
      `Use the reference “${siteConfig.name}” and confirm with your PIN.`,
    ],
    note: 'Keep the confirmation SMS — our team checks your payment before the order is confirmed.',
  },
  card: {
    title: 'How to pay with your Visa card',
    icon: CreditCard,
    details: [
      { label: 'Gateway', value: 'Pesapal' },
      { label: 'Reference', value: siteConfig.name },
      { label: 'Accepted', value: 'Visa · Mastercard · AMEX' },
    ],
    steps: [
      'Place your order to reserve your oils — you will get an order number.',
      'Tap “Pay now” on the confirmation screen to open the secure Pesapal page.',
      'Enter your card number, expiry date and CVV on the Pesapal page.',
      'Approve the one-time code (OTP) sent by your bank, then keep the receipt.',
    ],
    note: 'Your card details are entered on Pesapal’s secure page and are never stored by us.',
  },
  pesapal: {
    title: 'How to pay with Pesapal',
    icon: ShieldCheck,
    details: [
      { label: 'Gateway', value: 'Pesapal' },
      { label: 'Reference', value: siteConfig.name },
      { label: 'Accepted', value: 'Visa · Mastercard · Mobile money' },
    ],
    steps: [
      'Place your order to reserve your oils — you will get an order number.',
      'Tap “Pay now” on the confirmation screen to open the secure Pesapal page.',
      'Choose card or mobile money and follow the prompts.',
      'Keep the receipt — our team checks your payment before dispatch.',
    ],
    note: 'All card details are handled by Pesapal on their secure page.',
  },
  flutterwave: {
    title: 'How to pay with Flutterwave',
    icon: ShieldCheck,
    details: [
      { label: 'Gateway', value: 'Flutterwave' },
      { label: 'Accepted', value: 'Visa · Mastercard · Mobile money' },
      { label: 'Reference', value: siteConfig.name },
    ],
    steps: [
      'Place your order to reserve your oils — you will get an order number.',
      'Tap “Pay with Flutterwave” on the confirmation screen.',
      'Choose card or mobile money on Flutterwave’s secure page and approve the payment.',
      'You return here automatically and your order is confirmed the moment the payment succeeds.',
    ],
    note: 'Payments are verified automatically. Your card details are entered on Flutterwave’s secure page and are never stored by us.',
  },
  cash_on_delivery: {
    title: 'Cash on delivery',
    icon: Banknote,
    details: [
      { label: 'Pay when', value: 'On delivery' },
      { label: 'Reference', value: siteConfig.name },
    ],
    steps: [
      'Place your order — no payment is needed now.',
      'Keep the exact amount ready when your oils arrive.',
      'Our rider confirms the order with you by phone before delivery.',
    ],
    note: 'Please have the exact total ready; our riders may not carry change.',
  },
};

export function PaymentGuide({ method, amount }) {
  const guide = GUIDES[method];

  if (!guide) return null;

  const Icon = guide.icon;

  return (
    <div className="mt-3 rounded-2xl border border-gold/35 bg-gold/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-clay">
          <Icon className="size-3.5" aria-hidden="true" />
          {guide.title}
        </p>
        <p className="text-[11px] font-semibold text-ink/55">
          Pay <span className="font-display text-base font-semibold text-forest">{formatCurrency(amount)}</span>
        </p>
      </div>

      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        {guide.details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-xl border border-forest/10 bg-card px-3 py-2.5"
          >
            <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
              {detail.label}
            </dt>
            <dd
              className={`mt-1 text-sm font-bold text-forest ${
                detail.mono ? 'font-mono tracking-wide' : ''
              }`}
            >
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      <ol className="mt-4 space-y-2.5">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex gap-2.5 text-[11px] leading-5 text-ink/60">
            <span
              className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-bold text-ivory"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-forest/10 pt-3 text-[11px] leading-5 text-ink/50">
        {guide.note}
      </p>
    </div>
  );
}
