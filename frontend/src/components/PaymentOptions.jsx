import {
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

function MtnLockup() {
  return (
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 74 34" className="h-6 w-auto" role="img" aria-label="MTN">
        <ellipse cx="37" cy="17" rx="35" ry="15" fill="none" stroke="#111111" strokeWidth="3" />
        <text
          x="37"
          y="23"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="14"
          fontWeight="800"
          fill="#111111"
        >
          MTN
        </text>
      </svg>
      <span className="h-6 w-px bg-black/35" aria-hidden="true" />
      <span className="relative">
        <Smartphone className="size-4 text-black" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 grid size-3 place-items-center rounded-full bg-black text-[6px] font-black text-[#FFD400]">
          $
        </span>
      </span>
      <span className="text-[8px] font-extrabold leading-[1.05] text-black">
        Mobile
        <br />
        Money
      </span>
    </span>
  );
}

function AirtelLockup() {
  return (
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 40 40" className="size-5" aria-hidden="true" focusable="false">
        <path
          d="M33 7C20 4 7 10 4 21c-2 8 5 14 12 12 9-2 14-11 16-19"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M12 21c4-4 10-5 15-3"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <span className="h-6 w-px bg-white/45" aria-hidden="true" />
      <span className="leading-none text-white">
        <span className="block text-[15px] font-semibold tracking-tight">airtel</span>
        <span className="mt-0.5 block text-[8px] font-medium">money</span>
      </span>
    </span>
  );
}

function VisaLockup() {
  return (
    <span className="relative inline-flex items-start text-white">
      <span className="font-display text-[20px] font-black italic leading-none tracking-tight">
        VISA
      </span>
      <svg
        viewBox="0 0 28 10"
        className="absolute -left-0.5 top-0 h-1.5 w-4"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M0 0h18L9 10H0Z" fill="#F7B600" />
      </svg>
    </span>
  );
}

const BRAND_CARDS = {
  mtn_momo: {
    tagline: 'Pay with MTN Mobile Money',
    cta: 'MTN MoMo',
    surface: 'bg-[linear-gradient(135deg,#FFE45C_0%,#FFD400_48%,#EFAC00_100%)]',
    taglineClass: 'text-black/70',
    pillClass: 'bg-[#0A0A0A] text-white',
    logo: <MtnLockup />,
  },
  airtel_money: {
    tagline: 'Pay with Airtel Money',
    cta: 'Airtel Money',
    surface: 'bg-[linear-gradient(135deg,#FF3B2F_0%,#E40000_50%,#A30000_100%)]',
    taglineClass: 'text-white/80',
    pillClass: 'bg-[#5E0000]/85 text-white',
    logo: <AirtelLockup />,
  },
  card: {
    tagline: 'Pay securely with Visa',
    cta: 'Visa Card',
    surface: 'bg-[linear-gradient(135deg,#2E5BE8_0%,#1233B8_52%,#071C7A_100%)]',
    taglineClass: 'text-white/80',
    pillClass: 'bg-[#04134F]/90 text-white',
    logo: <VisaLockup />,
  },
};

export const PAYMENT_OPTIONS = [
  {
    value: 'mtn_momo',
    label: 'MTN Mobile Money',
    description: 'Pay from your MTN MoMo wallet on your phone',
    icon: Smartphone,
    brand: 'mtn_momo',
  },
  {
    value: 'airtel_money',
    label: 'Airtel Money',
    description: 'Pay from your Airtel Money wallet',
    icon: Smartphone,
    brand: 'airtel_money',
  },
  {
    value: 'card',
    label: 'Visa Card',
    description: 'Pay securely with a debit or credit card',
    icon: CreditCard,
    brand: 'card',
  },
  {
    value: 'pesapal',
    label: 'Pesapal',
    description: 'Cards and mobile money through Pesapal',
    icon: ShieldCheck,
    fullWidth: true,
  },
  {
    value: 'cash_on_delivery',
    label: 'Cash on delivery',
    description: 'Pay in cash when your order arrives',
    icon: Banknote,
    fullWidth: true,
  },
];

export function renderPaymentOption(option, { isSelected, isActive }) {
  const Icon = option.icon;
  const card = option.brand ? BRAND_CARDS[option.brand] : null;

  if (!card) {
    return (
      <span
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
          isSelected ? 'border-forest/30 bg-sand/60' : 'border-forest/10 bg-card'
        } ${isActive && !isSelected ? 'ring-1 ring-inset ring-forest/20' : ''}`}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-sand text-forest">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-xs font-bold text-forest">
            {option.label}
            {isSelected && <Check className="size-3" aria-hidden="true" />}
          </span>
          <span className="mt-0.5 block text-[11px] leading-4 text-ink/45">{option.description}</span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`relative flex h-full min-h-[132px] flex-col overflow-hidden rounded-2xl p-3.5 shadow-soft transition ${card.surface} ${
        isSelected ? 'ring-2 ring-gold ring-offset-2 ring-offset-surface' : ''
      } ${isActive && !isSelected ? 'ring-2 ring-white/70' : ''}`}
    >
      <span
        className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-white/25 blur-xl"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -bottom-10 -left-6 size-20 rounded-full bg-black/10 blur-xl"
        aria-hidden="true"
      />

      <span className="relative flex items-start justify-between gap-2">
        {card.logo}
        <span
          className={`grid size-4 shrink-0 place-items-center rounded-full transition ${
            isSelected ? 'bg-white text-forest shadow' : 'bg-white/25 text-white/0'
          }`}
          aria-hidden="true"
        >
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      </span>

      <span
        className={`relative mt-4 block text-[10px] font-semibold italic leading-4 ${card.taglineClass}`}
      >
        {card.tagline}
      </span>

      <span
        className={`relative mt-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${card.pillClass}`}
      >
        <Icon className="size-3" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{card.cta}</span>
        <ChevronRight className="size-3 opacity-70" aria-hidden="true" />
      </span>
    </span>
  );
}
