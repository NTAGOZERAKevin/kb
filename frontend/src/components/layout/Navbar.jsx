import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/auth-context.js';
import { useCart } from '../../context/cart-context.js';
import { siteConfig } from '../../config/site.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { hasDashboardAccess } from '../../utils/roles.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';

const navigation = [
  { label: 'Shop', href: '/shop' },
  { label: 'Ritual Finder', href: '/#ritual-finder' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Contact', href: '/#contact' },
];

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function CartIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

function CartLink({ count, onClick, className = '' }) {
  return (
    <Link
      to="/cart"
      onClick={onClick}
      className={`group relative grid size-11 place-items-center rounded-full border border-forest/10 bg-forest/[0.03] text-forest transition hover:border-gold hover:bg-gold hover:text-forest-dark ${className}`}
      aria-label={`Cart with ${count} item${count === 1 ? '' : 's'}`}
    >
      <CartIcon className="size-[18px]" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-gold px-1 py-0.5 text-[9px] font-bold text-forest-dark ring-2 ring-surface">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const { user, isLoading } = useAuth();
  const { count } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest-dark px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/75 sm:text-[11px]">
        Complimentary delivery on orders over {formatCurrency(siteConfig.freeDeliveryThreshold)}
      </div>

      <div className="border-b border-forest/10 bg-surface/95 backdrop-blur-xl">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8"
        >
          <Logo size="nav" framed onClick={() => setIsMenuOpen(false)} />

          <div className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group relative text-xs font-bold uppercase tracking-[0.16em] text-forest/70 transition hover:text-forest"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            {hasDashboardAccess(user) && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-clay transition hover:text-forest"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                Dashboard
              </Link>
            )}

            <CartLink count={count} />

            {isLoading ? (
              <span className="h-9 w-24 animate-pulse rounded-full bg-forest/10" />
            ) : user ? (
              <Link
                to="/profile"
                className="group flex items-center gap-2.5 text-sm font-semibold text-forest"
              >
                <span className="grid size-9 place-items-center rounded-full bg-forest text-xs font-bold text-ivory transition group-hover:bg-gold group-hover:text-forest-dark">
                  {getInitials(user.name)}
                </span>
                <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-[0.16em] text-forest/70 transition hover:text-forest"
              >
                Sign in
              </Link>
            )}
            <Button to="/register" variant="primary" size="sm">
              Create account
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <CartLink count={count} />
            <button
              type="button"
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              className="grid size-11 place-items-center rounded-full border border-forest/15 text-forest"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-7rem)] overflow-y-auto border-b border-forest/10 bg-surface px-4 pb-8 pt-4 shadow-2xl lg:hidden"
        >
          <div className="flex flex-col">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-forest/10 py-4 font-display text-2xl text-forest"
              >
                {item.label}
              </a>
            ))}
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-forest/10 py-4 font-display text-2xl text-forest"
              >
                My orders
              </Link>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {user ? (
              <>
                {hasDashboardAccess(user) && (
                  <Button to="/admin" onClick={() => setIsMenuOpen(false)}>
                    Admin dashboard
                  </Button>
                )}
                <Button to="/profile" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  My profile
                </Button>
                <p className="break-all text-center text-xs text-ink/50">Signed in as {user.email}</p>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Button>
                <Button to="/register" onClick={() => setIsMenuOpen(false)}>
                  Create account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
