import { useEffect, useState } from 'react';
import { ArrowRight, Package, ReceiptText } from 'lucide-react';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { orderService } from '../services/store.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const steps = ['pending', 'confirmed', 'preparing', 'delivered'];

export default function Orders() {
  useDocumentTitle('My Orders');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    orderService
      .myOrders()
      .then((data) => {
        if (isActive) {
          setOrders(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load your orders.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="bg-sand/35 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
              Order history
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
              Your rituals, on their way.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-ink/55">
              Follow every order from the moment it is placed until it reaches your door.
            </p>
          </div>
          <Button to="/shop" variant="outline">
            Continue shopping
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Reveal>

        {error && <div className="mt-6"><Alert>{error}</Alert></div>}

        {isLoading ? (
          <div className="mt-10 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-40 rounded-[2rem]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-[2rem] border border-dashed border-forest/20 bg-surface px-6 py-20 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-sand text-forest">
              <Package className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-medium text-forest">No orders yet.</h2>
            <p className="mt-2 max-w-sm text-sm text-ink/50">
              Your first ritual is one click away. Explore the collection to get started.
            </p>
            <Button to="/shop" className="mt-6">
              Browse the collection
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {orders.map((order, index) => {
              const currentStep = steps.indexOf(order.status);
              const isCancelled = order.status === 'cancelled';

              return (
                <Reveal
                  key={order._id}
                  delay={index * 70}
                  className="rounded-[2rem] border border-forest/10 bg-surface p-5 sm:p-7"
                >
                  <div className="flex flex-col gap-3 border-b border-forest/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                        <ReceiptText className="size-3.5" aria-hidden="true" />
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-ink/40">
                        Placed{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="font-display text-2xl font-semibold text-forest">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {order.items.map((item) => (
                      <div key={item.product} className="flex items-center gap-3 rounded-2xl bg-sand/50 p-2 pr-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-forest">{item.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isCancelled ? (
                    <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                      This order was cancelled. Contact us if you need help placing a new one.
                    </p>
                  ) : (
                    <ol className="mt-6 grid grid-cols-4 gap-2">
                      {steps.map((step, stepIndex) => {
                        const done = stepIndex <= currentStep;
                        return (
                          <li key={step} className="relative">
                            <span
                              className={`block h-1.5 rounded-full transition-all duration-700 ${
                                done ? 'bg-gold' : 'bg-forest/10'
                              }`}
                            />
                            <span
                              className={`mt-2 block text-[9px] font-bold uppercase tracking-[0.1em] ${
                                done ? 'text-forest' : 'text-ink/30'
                              }`}
                            >
                              {step}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
