import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { useCart } from '../context/cart-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const FREE_DELIVERY_THRESHOLD = 50000;
const DELIVERY_FEE = 3000;

export default function Cart() {
  useDocumentTitle('Your Cart');

  const { items, subtotal, count, updateQuantity, removeItem } = useCart();
  const deliveryFee = items.length === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-sand text-forest">
          <ShoppingBag className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-medium text-forest">Your cart is empty.</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-ink/55">
          A little glow is waiting. Browse the collection and add the oils your ritual has
          been missing.
        </p>
        <Button to="/shop" size="lg" className="mt-8">
          Explore the collection
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </section>
    );
  }

  return (
    <section className="bg-sand/35 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">Your bag</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
            {count} item{count === 1 ? '' : 's'} for your ritual.
          </h1>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Reveal className="space-y-4">
            {items.map((item) => (
              <article
                key={item.product}
                className="flex gap-4 rounded-[2rem] border border-forest/10 bg-surface p-4 sm:p-5"
              >
                <Link
                  to={`/shop/${item.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-2xl bg-sand sm:size-28"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover transition duration-500 hover:scale-105"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-semibold text-forest">
                        <Link to={`/shop/${item.slug}`} className="hover:text-forest-light">
                          {item.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-ink/45">{formatCurrency(item.price)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product)}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-ink/35 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-forest/15 bg-card px-1 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="grid size-8 place-items-center rounded-full text-forest transition hover:bg-forest/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-forest">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="grid size-8 place-items-center rounded-full text-forest transition hover:bg-forest/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-forest">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>

          <Reveal delay={120}>
            <div className="sticky top-28 rounded-[2rem] bg-forest p-6 text-ivory sm:p-8">
              <h2 className="font-display text-2xl font-medium">Order summary</h2>

              <div className="mt-6 space-y-3 text-sm">
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

              <div className="mt-5 border-t border-ivory/10 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-ivory/50">
                    Total
                  </span>
                  <span className="font-display text-3xl font-semibold text-gold">
                    {formatCurrency(subtotal + deliveryFee)}
                  </span>
                </div>
              </div>

              {remainingForFreeDelivery > 0 ? (
                <div className="mt-6 rounded-2xl bg-ivory/5 p-4">
                  <p className="flex items-center gap-2 text-xs text-ivory/60">
                    <Truck className="size-3.5 text-gold" aria-hidden="true" />
                    Add {formatCurrency(remainingForFreeDelivery)} for free delivery
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                    <span
                      className="block h-full rounded-full bg-gold transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-6 flex items-center gap-2 rounded-2xl bg-gold/15 p-4 text-xs font-semibold text-gold">
                  <Truck className="size-4" aria-hidden="true" />
                  You unlocked free delivery.
                </p>
              )}

              <Button to="/checkout" variant="gold" size="lg" className="mt-6 w-full">
                Checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Link
                to="/shop"
                className="mt-4 block text-center text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/45 transition hover:text-ivory"
              >
                Continue shopping
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
