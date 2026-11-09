import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Clock3,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert.jsx';
import { AnimatedNumber } from '../components/ui/AnimatedNumber.jsx';
import { Button } from '../components/ui/Button.jsx';
import { InputField } from '../components/ui/InputField.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { siteConfig } from '../config/site.js';
import { useAuth } from '../context/auth-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { orderService } from '../services/store.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const activeStatuses = ['pending', 'confirmed', 'preparing'];

function formatAddress(address) {
  if (!address) {
    return 'No delivery address saved yet';
  }

  return [address.street, address.city, address.district, address.country]
    .filter(Boolean)
    .join(', ');
}

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatDate(value, options) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString('en-US', options);
}

function MetricCard({ icon: Icon, label, value, format, hint, accent, delay = 0 }) {
  return (
    <article
      className="group relative overflow-hidden rounded-[1.75rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-45px_rgba(14,42,35,0.5)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(14,42,35,0.45)]"
      style={{ animation: `fade-up 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
            <AnimatedNumber value={value} format={format} />
          </p>
          {hint && <p className="mt-2 text-xs text-ink/45">{hint}</p>}
        </div>
        <span
          className="grid size-11 shrink-0 place-items-center rounded-2xl text-white"
          style={{ backgroundColor: accent }}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export default function Profile() {
  useDocumentTitle('My Dashboard');

  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    district: user.address?.district || '',
    country: user.address?.country || 'Rwanda',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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
          setOrdersError(getErrorMessage(requestError, 'We could not load your orders.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingOrders(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setNotice('');
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          district: form.district,
          country: form.country,
        },
      });
      setNotice('Your details have been saved.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not save your details.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsSigningOut(true);
    await logout();
    navigate('/', { replace: true });
  }

  const firstName = user.name.split(' ')[0];
  const initials = initialsOf(user.name);
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) => activeStatuses.includes(order.status)).length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const totalSpent = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  const memberSince = formatDate(user.createdAt, { month: 'long', year: 'numeric' });

  return (
    <section className="bg-sand/45 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-forest p-7 text-ivory sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-gold/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-moss/30 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                <Sparkles className="size-3.5" aria-hidden="true" />
                My dashboard
              </p>
              <h1 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-3 text-sm leading-7 text-ivory/60">
                Your rituals, orders and details all in one place. Here is everything happening
                with your beauty collection.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/shop" variant="gold" size="md">
                  Continue shopping
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button to="/orders" variant="light" size="md">
                  <Package className="size-4" aria-hidden="true" />
                  My orders
                </Button>
                {user.role === 'admin' && (
                  <Button to="/admin" variant="light" size="md">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Admin dashboard
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[2rem] border border-ivory/10 bg-ivory/5 p-5 backdrop-blur-sm">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gold font-display text-2xl font-semibold text-forest-dark">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-medium">{user.name}</h2>
                <p className="mt-1 truncate text-xs text-ivory/55">{user.email}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/40">
                  <ShieldCheck className="size-3.5 text-gold" aria-hidden="true" />
                  {user.role} · since {memberSince}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={ShoppingBag}
            label="Total orders"
            value={totalOrders}
            hint="Every ritual you have started"
            accent="#173b32"
            delay={0}
          />
          <MetricCard
            icon={Truck}
            label="On the way"
            value={activeOrders}
            hint="Orders currently in progress"
            accent="#c87d5a"
            delay={70}
          />
          <MetricCard
            icon={CalendarCheck}
            label="Delivered"
            value={deliveredOrders}
            hint="Rituals that reached your door"
            accent="#5b705c"
            delay={140}
          />
          <MetricCard
            icon={Wallet}
            label="Total spent"
            value={totalSpent}
            format={(value) => formatCurrency(value)}
            hint="Across your beauty collection"
            accent="#c7a46b"
            delay={210}
          />
        </div>

        {ordersError && (
          <div className="mt-6">
            <Alert>{ordersError}</Alert>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <Reveal className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-50px_rgba(14,42,35,0.5)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                  Latest activity
                </p>
                <h2 className="mt-2 font-display text-3xl font-medium text-forest">
                  Recent orders
                </h2>
              </div>
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-clay transition hover:text-forest"
              >
                View all
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6">
              {isLoadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="skeleton h-20 rounded-2xl" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="grid place-items-center rounded-[1.5rem] border border-dashed border-forest/20 bg-surface px-6 py-14 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-sand text-forest">
                    <ShoppingBag className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-display text-2xl text-forest">No orders yet.</p>
                  <p className="mt-1 text-sm text-ink/50">
                    Your first ritual is one click away.
                  </p>
                  <Button to="/shop" className="mt-5" size="sm">
                    Browse the collection
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentOrders.map((order) => (
                    <li
                      key={order._id}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-forest/8 bg-surface p-4 transition hover:border-forest/20"
                    >
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item) => (
                          <img
                            key={item.product}
                            src={item.image}
                            alt={item.name}
                            className="size-11 rounded-xl border-2 border-surface object-cover"
                          />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-forest">
                          {order.orderNumber}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink/40">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {formatDate(order.createdAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                      <span className="ml-auto font-display text-xl font-semibold text-forest">
                        {formatCurrency(order.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          <Reveal delay={120} className="rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-50px_rgba(14,42,35,0.5)] sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
              Account snapshot
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-forest">Your details</h2>

            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-center gap-3 rounded-2xl bg-sand/50 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/5 text-forest">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                    Full name
                  </p>
                  <p className="truncate font-semibold text-forest">{user.name}</p>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-sand/50 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/5 text-forest">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                    Email
                  </p>
                  <p className="truncate font-semibold text-forest">{user.email}</p>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-sand/50 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/5 text-forest">
                  <Phone className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                    Phone
                  </p>
                  <p className="truncate font-semibold text-forest">
                    {user.phone || 'Not added yet'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-sand/50 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/5 text-forest">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                    Delivery address
                  </p>
                  <p className="font-semibold leading-6 text-forest">{formatAddress(user.address)}</p>
                </div>
              </li>
            </ul>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-forest/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:border-forest hover:text-forest disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </Reveal>
        </div>

        <Reveal className="mt-6 rounded-[2rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-50px_rgba(14,42,35,0.5)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                Edit details
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-forest">
                Keep your account current
              </h2>
              <p className="mt-2 text-sm text-ink/50">
                Update your name, phone number and the address we deliver to.
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest/5 text-forest">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            {notice && <Alert type="success">{notice}</Alert>}
            {error && <Alert>{error}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="profile-name"
                name="name"
                label="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <InputField
                id="profile-phone"
                name="phone"
                type="tel"
                label="Phone number"
                value={form.phone}
                onChange={handleChange}
                placeholder="+250 788 000 000"
                hint="Used for delivery updates"
              />
              <InputField
                id="profile-street"
                name="street"
                label="Street address"
                value={form.street}
                onChange={handleChange}
                placeholder="KG 11 Ave, House 24"
              />
              <InputField
                id="profile-city"
                name="city"
                label="City"
                value={form.city}
                onChange={handleChange}
                placeholder="Kigali"
              />
              <InputField
                id="profile-district"
                name="district"
                label="District"
                value={form.district}
                onChange={handleChange}
                placeholder="Gasabo"
              />
              <InputField
                id="profile-country"
                name="country"
                label="Country"
                value={form.country}
                onChange={handleChange}
                placeholder="Rwanda"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save details'}
            </button>
          </form>
        </Reveal>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-[2rem] bg-gold/15 p-7">
            <Leaf className="size-6 text-clay" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-medium text-forest">Your next ritual</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Explore our current oils and find the one your routine has been missing.
            </p>
            <a
              href="/#collection"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-forest"
            >
              View the collection
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="rounded-[2rem] border border-forest/10 bg-surface p-7">
            <Mail className="size-6 text-clay" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-medium text-forest">Need a hand?</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              We are always happy to help with your account or your order.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-forest"
            >
              Contact us
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
