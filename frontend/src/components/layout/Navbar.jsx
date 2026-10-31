import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/auth-context.js';
import { siteConfig } from '../../config/site.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';

const navigation = [
  { label: 'Shop', href: '/#collection' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Reviews', href: '/#reviews' },
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

export function Navbar() {
  const { user, isLoading } = useAuth();
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

      <div className="border-b border-forest/10 bg-ivory/95 backdrop-blur-xl">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <Logo onClick={() => setIsMenuOpen(false)} />

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

          <div className="hidden items-center gap-5 lg:flex">
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

          <button
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            className="grid size-11 place-items-center rounded-full border border-forest/15 text-forest lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-forest/10 bg-ivory px-4 pb-8 pt-4 shadow-2xl lg:hidden"
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
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {user ? (
              <>
                <Button to="/profile" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  My profile
                </Button>
                <p className="text-center text-xs text-ink/50">Signed in as {user.email}</p>
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
