import { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AdminSignInOverlay } from '../components/auth/AdminSignInOverlay.jsx';
import { Button } from '../components/ui/Button.jsx';
import { siteConfig } from '../config/site.js';
import { PageLoader } from '../components/ui/PageLoader.jsx';
import { useAuth } from '../context/auth-context.js';
import { hasDashboardAccess } from '../utils/roles.js';

function AdminAccessDenied({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function switchAccount() {
    setIsSigningOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-sand/40 px-4 py-12">
      <section className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-forest/10 bg-card shadow-[0_24px_80px_-40px_rgba(34,4,33,0.5)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-forest via-clay to-gold" />
        <div className="p-7 sm:p-9">
          <span className="grid size-12 place-items-center rounded-full bg-forest/5 text-clay">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
            Staff access only
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-forest">
            This dashboard needs a staff account.
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink/55">
            You are signed in, but this account can shop — it cannot open the admin dashboard.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sand/60 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest font-display text-sm font-semibold text-ivory">
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-forest">{user?.name}</p>
              <p className="truncate text-xs text-ink/50">{user?.email}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-forest/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest/60">
              {user?.role}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button type="button" size="lg" onClick={switchAccount} isLoading={isSigningOut}>
              <LogIn className="size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out...' : 'Sign in as staff'}
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button to="/profile" variant="outline" size="md">
                <UserRound className="size-4" aria-hidden="true" />
                My account
              </Button>
              <Button to="/" variant="ghost" size="md">
                Back to the shop
              </Button>
            </div>
          </div>

          <p className="mt-6 flex items-start gap-2 border-t border-forest/10 pt-5 text-xs leading-5 text-ink/45">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
            <span>
              Use the boutique's owner or admin email to sign in. Need access for this account?{' '}
              <Link
                to={`mailto:${siteConfig.email}`}
                className="font-bold text-forest underline underline-offset-2"
              >
                Ask the owner
              </Link>{' '}
              to add you to the team.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader label="Preparing your dashboard" />;
  }

  if (!user) {
    return <AdminSignInOverlay redirectTo={`${location.pathname}${location.search}`} />;
  }

  if (!hasDashboardAccess(user)) {
    return <AdminAccessDenied user={user} />;
  }

  return children;
}
