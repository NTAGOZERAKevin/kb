import { useState } from 'react';
import {
  ArrowRight,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { siteConfig } from '../config/site.js';
import { useAuth } from '../context/auth-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function formatAddress(address) {
  if (!address) {
    return 'No delivery address saved yet';
  }

  return [address.street, address.city, address.district, address.country]
    .filter(Boolean)
    .join(', ');
}

export default function Profile() {
  useDocumentTitle('My Account');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await logout();
    navigate('/', { replace: true });
  }

  const firstName = user.name.split(' ')[0];
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <section className="bg-sand/45 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
              My account
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ink/55">
              Your details, orders, and saved rituals will live here as your beauty
              collection grows.
            </p>
          </div>
          <Button href="/#collection" variant="outline">
            Continue shopping
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
          <aside className="rounded-[2rem] bg-forest p-7 text-ivory">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gold font-display text-2xl font-semibold text-forest-dark">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-medium">{user.name}</h2>
                <p className="mt-1 truncate text-xs text-ivory/50">{user.email}</p>
              </div>
            </div>

            <div className="mt-7 space-y-4 border-t border-ivory/10 pt-6 text-sm">
              <div className="flex items-center gap-3 text-ivory/65">
                <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
                <span className="capitalize">{user.role} account</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/65">
                <Phone className="size-4 text-gold" aria-hidden="true" />
                <span>{user.phone || 'No phone number added'}</span>
              </div>
              <div className="flex items-start gap-3 text-ivory/65">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{formatAddress(user.address)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-ivory/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ivory/75 transition hover:border-ivory/45 hover:text-ivory disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-forest/10 bg-ivory p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                    Account details
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-medium text-forest">
                    Your information
                  </h2>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-forest/5 text-forest">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
              </div>

              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-sand/60 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Full name
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-forest">{user.name}</dd>
                </div>
                <div className="rounded-2xl bg-sand/60 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Email address
                  </dt>
                  <dd className="mt-2 flex items-center gap-2 break-all text-sm font-semibold text-forest">
                    <Mail className="size-3.5 shrink-0 text-clay" aria-hidden="true" />
                    {user.email}
                  </dd>
                </div>
                <div className="rounded-2xl bg-sand/60 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Phone number
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-forest">
                    {user.phone || 'Not added yet'}
                  </dd>
                </div>
                <div className="rounded-2xl bg-sand/60 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Delivery address
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-forest">
                    {formatAddress(user.address)}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 text-xs leading-6 text-ink/45">
                Profile editing and delivery addresses will be available in the next
                account build. For urgent changes, contact{' '}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-semibold text-forest underline underline-offset-4"
                >
                  {siteConfig.email}
                </a>
                .
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-gold/15 p-7">
                <Leaf className="size-6 text-clay" aria-hidden="true" />
                <h2 className="mt-4 font-display text-2xl font-medium text-forest">
                  Your next ritual
                </h2>
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

              <div className="rounded-[2rem] border border-forest/10 bg-ivory p-7">
                <Mail className="size-6 text-clay" aria-hidden="true" />
                <h2 className="mt-4 font-display text-2xl font-medium text-forest">
                  Need a hand?
                </h2>
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
        </div>
      </div>
    </section>
  );
}
