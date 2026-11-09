import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { InputField } from '../components/ui/InputField.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { useAuth } from '../context/auth-context.js';
import { useCart } from '../context/cart-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { orderService } from '../services/store.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const paymentMethods = [
  { value: 'mtn_momo', label: 'MTN MoMo', hint: 'Pay from your MTN wallet', icon: Smartphone },
  { value: 'airtel_money', label: 'Airtel Money', hint: 'Pay from your Airtel wallet', icon: Wallet },
  { value: 'card', label: 'Card payment', hint: 'Visa or Mastercard', icon: CreditCard },
  {
    value: 'cash_on_delivery',
    label: 'Cash on delivery',
    hint: 'Pay when your oils arrive',
    icon: Banknote,
  },
];

export default function Checkout() {
  useDocumentTitle('Checkout');

  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Kigali',
    district: user?.address?.district || '',
    country: user?.address?.country || 'Rwanda',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mtn_momo');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const deliveryFee = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + deliveryFee;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      const order = await orderService.create({
        items: items.map((item) => ({ product: item.product, quantity: item.quantity })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          street: form.street,
          city: form.city,
          district: form.district,
          country: form.country,
        },
        paymentMethod,
        notes: form.notes,
      });
      setPlacedOrder(order);
      clearCart();
    } catch (requestError) {
      const details = requestError.response?.data?.errors;
      if (details?.length) {
        setFieldErrors(
          Object.fromEntries(details.map((detail) => [detail.field.split('.').at(-1), detail.message])),
        );
      }
      setError(getErrorMessage(requestError, 'We could not place your order.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePay() {
    setIsPaying(true);
    setPaymentError('');

    try {
      const data = await orderService.pay(placedOrder._id);
      setPaymentInfo(data.payment);
      setPlacedOrder(data.order);
    } catch (requestError) {
      setPaymentError(getErrorMessage(requestError, 'We could not start your payment.'));
    } finally {
      setIsPaying(false);
    }
  }

  if (placedOrder) {
    const placedPayment = paymentMethods.find(
      (method) => method.value === placedOrder.paymentMethod,
    );

    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700 animate-pulse-ring">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
          Order confirmed
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
          Thank you, {placedOrder.customer.name.split(' ')[0]}.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/55">
          Your oils are being prepared with care. We will contact you on{' '}
          {placedOrder.customer.phone || placedOrder.customer.email} to confirm delivery.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-[2rem] border border-forest/10 bg-surface p-6 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/45">Order number</span>
            <span className="font-bold text-forest">{placedOrder.orderNumber}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink/45">Total</span>
            <span className="font-bold text-forest">{formatCurrency(placedOrder.total)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink/45">Payment</span>
            <span className="font-bold capitalize text-forest">
              {placedOrder.paymentMethod.replaceAll('_', ' ')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink/45">Status</span>
            <span className="font-bold capitalize text-forest">{placedOrder.status}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink/45">Payment status</span>
            <span className="font-bold capitalize text-forest">{placedOrder.paymentStatus}</span>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-sm">
          {placedOrder.paymentMethod === 'cash_on_delivery' ? (
            <p className="rounded-[2rem] border border-forest/10 bg-card p-5 text-left text-sm leading-6 text-ink/55">
              Keep {formatCurrency(placedOrder.total)} ready. You will pay in cash when your oils
              arrive.
            </p>
          ) : placedOrder.paymentStatus === 'paid' ? (
            <p className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-left text-sm font-semibold text-emerald-700">
              Payment received. Your order is confirmed.
            </p>
          ) : paymentInfo ? (
            <div className="rounded-[2rem] border border-gold/40 bg-gold/10 p-5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">
                {paymentInfo.provider} reference
              </p>
              <p className="mt-2 font-mono text-lg font-bold tracking-wider text-forest">
                {paymentInfo.reference}
              </p>
              <p className="mt-3 text-xs leading-6 text-ink/60">{paymentInfo.instructions}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                Awaiting confirmation from our team
              </p>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-forest/10 bg-card p-5 text-left">
              <p className="text-sm leading-6 text-ink/55">
                Complete your {placedPayment?.label || 'online'} payment to confirm this order.
              </p>
              {paymentError && (
                <div className="mt-3">
                  <Alert>{paymentError}</Alert>
                </div>
              )}
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaying}
                className="mt-4 w-full rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
              >
                {isPaying ? 'Starting payment...' : `Pay with ${placedPayment?.label || 'online'}`}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/orders" size="lg">
            <Package className="size-4" aria-hidden="true" />
            View my orders
          </Button>
          <Button to="/shop" variant="outline" size="lg">
            Continue shopping
          </Button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-medium text-forest">Nothing to check out yet.</h1>
        <p className="mt-3 text-sm text-ink/55">Add a few oils to your cart first.</p>
        <Button to="/shop" className="mt-6">
          Browse the collection
        </Button>
      </section>
    );
  }

  return (
    <section className="bg-sand/35 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">Checkout</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
            Almost yours.
          </h1>
        </Reveal>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
          <div className="space-y-6">
            <Reveal className="rounded-[2rem] border border-forest/10 bg-surface p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-forest">
                <MapPin className="size-5 text-clay" aria-hidden="true" />
                Delivery details
              </h2>

              {error && <div className="mt-4"><Alert>{error}</Alert></div>}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InputField
                  id="checkout-name"
                  name="name"
                  label="Full name"
                  value={form.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  required
                />
                <InputField
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  label="Phone number"
                  value={form.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  placeholder="+250 78..."
                  required
                />
                <InputField
                  id="checkout-email"
                  name="email"
                  type="email"
                  label="Email address"
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  className="sm:col-span-2"
                  required
                />
                <InputField
                  id="checkout-street"
                  name="street"
                  label="Street address"
                  value={form.street}
                  onChange={handleChange}
                  error={fieldErrors.street}
                  placeholder="KG 11 Ave, house number"
                  className="sm:col-span-2"
                  required
                />
                <InputField
                  id="checkout-city"
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={handleChange}
                  error={fieldErrors.city}
                  required
                />
                <InputField
                  id="checkout-district"
                  name="district"
                  label="District"
                  value={form.district}
                  onChange={handleChange}
                  error={fieldErrors.district}
                  placeholder="Gasabo"
                />
                <InputField
                  id="checkout-country"
                  name="country"
                  label="Country"
                  value={form.country}
                  onChange={handleChange}
                  className="sm:col-span-2"
                />
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                  Delivery notes (optional)
                </span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Landmark, gate colour, best time to deliver..."
                  className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
                />
              </label>
            </Reveal>

            <Reveal delay={100} className="rounded-[2rem] border border-forest/10 bg-surface p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-forest">
                <CreditCard className="size-5 text-clay" aria-hidden="true" />
                Payment method
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {paymentMethods.map(({ value, label, hint, icon: Icon }) => {
                  const active = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-forest bg-forest text-ivory shadow-soft'
                          : 'border-forest/15 bg-card text-forest hover:border-forest/35'
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 size-5 shrink-0 ${active ? 'text-gold' : 'text-clay'}`}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-sm font-bold">{label}</span>
                        <span
                          className={`mt-1 block text-xs ${
                            active ? 'text-ivory/55' : 'text-ink/45'
                          }`}
                        >
                          {hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-ink/40">
                <Lock className="size-3.5" aria-hidden="true" />
                Payment is confirmed by our team after your order is placed.
              </p>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="sticky top-28 rounded-[2rem] bg-forest p-6 text-ivory sm:p-8">
              <h2 className="font-display text-2xl font-medium">Your order</h2>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item.product} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 text-ivory/65">
                      <span className="block truncate">{item.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-ivory/35">
                        Qty {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 border-t border-ivory/10 pt-5 text-sm">
                <div className="flex items-center justify-between text-ivory/65">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ivory">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-ivory/65">
                  <span>Delivery</span>
                  <span className="font-semibold text-ivory">
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-ivory/10 pt-5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-ivory/50">
                  Total
                </span>
                <span className="font-display text-3xl font-semibold text-gold">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" isLoading={isSubmitting}>
                {isSubmitting ? 'Placing order...' : 'Place order'}
              </Button>
              <Link
                to="/cart"
                className="mt-4 block text-center text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/45 transition hover:text-ivory"
              >
                Back to cart
              </Link>
            </div>
          </Reveal>
        </form>
      </div>
    </section>
  );
}
