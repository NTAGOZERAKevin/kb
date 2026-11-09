import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  DonutChart,
  SalesChart,
  StatCard,
  TopProductsChart,
} from '../../components/admin/Charts.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/auth-context.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { dashboardService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

function greetingForHour(hour) {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export default function Dashboard() {
  useDocumentTitle('Admin Dashboard');

  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    dashboardService
      .get()
      .then((result) => {
        if (isActive) {
          setData(result);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load your dashboard.'));
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
  }, [reloadKey]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-28 rounded-[2rem]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-44 rounded-[1.75rem]" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="skeleton h-80 rounded-[2rem]" />
          <div className="skeleton h-80 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Alert>{error || 'Dashboard unavailable'}</Alert>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-4 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ivory"
        >
          Try again
        </button>
      </div>
    );
  }

  const weekRevenue = data.salesSeries.reduce((sum, entry) => sum + entry.total, 0);

  return (
    <div className="space-y-6">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-forest p-6 text-ivory sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-moss/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {greetingForHour(now.getHours())}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">
              {firstName}, here is your glow report.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ivory/60">
              {data.pendingOrders > 0
                ? `${data.pendingOrders} order${data.pendingOrders === 1 ? '' : 's'} need your attention today.`
                : 'Every order is up to date. Beautiful work.'}
            </p>
            <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/40">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-forest-dark transition hover:-translate-y-0.5 hover:bg-gold-light"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Link>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:border-ivory/50 hover:bg-ivory/10"
            >
              Manage orders
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-ivory/10 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-ivory/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ivory/40">
              Orders today
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-ivory">
              {data.todayOrders}
            </p>
          </div>
          <div className="rounded-2xl bg-ivory/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ivory/40">
              Awaiting you
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-ivory">
              {data.pendingOrders}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-gold/15 px-4 py-3 backdrop-blur-sm sm:col-span-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
              This month
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-ivory">
              {formatCurrency(data.monthSales)}
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="Total revenue"
          value={data.revenue}
          format={(value) => formatCurrency(value)}
          hint={`${formatCurrency(data.monthSales)} this month`}
          accent="#173b32"
          delay={0}
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={data.orders}
          hint={`${data.todayOrders} today · ${data.pendingOrders} open`}
          accent="#c87d5a"
          delay={90}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={data.customers}
          hint="Registered beauty lovers"
          accent="#5b705c"
          delay={180}
        />
        <StatCard
          icon={Package}
          label="Active products"
          value={data.products}
          hint={`${data.lowStock.length} low on stock`}
          accent="#c7a46b"
          delay={270}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Reveal className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-45px_rgba(14,42,35,0.5)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
                Sales performance
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium text-forest">
                Last 7 days
              </h2>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-forest">
                <AnimatedNumber value={weekRevenue} format={(value) => formatCurrency(value)} />
              </p>
              <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                <TrendingUp className="size-3" aria-hidden="true" />
                {data.salesSeries.reduce((sum, entry) => sum + entry.orders, 0)} orders
              </p>
            </div>
          </div>
          <div className="mt-4">
            <SalesChart data={data.salesSeries} />
          </div>
        </Reveal>

        <Reveal delay={120} className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-45px_rgba(14,42,35,0.5)] sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
            Order pipeline
          </p>
          <h2 className="mt-1 font-display text-2xl font-medium text-forest">Status breakdown</h2>
          <div className="mt-6">
            <DonutChart breakdown={data.statusBreakdown} />
          </div>
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <Reveal className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-45px_rgba(14,42,35,0.5)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
                Latest activity
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium text-forest">Recent orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-clay transition hover:text-forest"
            >
              View all
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            {data.recentOrders.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/40">No orders yet.</p>
            ) : (
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest/10 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/35">
                    <th className="pb-3 pr-3">Order</th>
                    <th className="pb-3 pr-3">Customer</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order, index) => (
                    <tr
                      key={order._id}
                      className="border-b border-forest/5 last:border-0"
                      style={{
                        animation: `fade-up 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms both`,
                      }}
                    >
                      <td className="py-3.5 pr-3 font-semibold text-forest">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 pr-3 text-ink/60">
                        {order.customer?.name || order.user?.name || 'Customer'}
                      </td>
                      <td className="py-3.5 pr-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 text-right font-bold text-forest">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={80} className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-45px_rgba(14,42,35,0.5)] sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium text-forest">Top products</h2>
              <TrendingUp className="size-4 text-clay" aria-hidden="true" />
            </div>
            <div className="mt-5">
              <TopProductsChart data={data.topProducts} />
            </div>
          </Reveal>

          <Reveal delay={140} className="rounded-[2rem] border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium text-forest">Low stock</h2>
              <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
            </div>
            {data.lowStock.length === 0 ? (
              <p className="mt-4 text-sm text-ink/45">Everything is well stocked.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.lowStock.map((product) => (
                  <li key={product._id} className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-forest">{product.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-ink/40">
                        {product.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                      {product.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/admin/products"
              className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-clay transition hover:text-forest"
            >
              Restock products
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
