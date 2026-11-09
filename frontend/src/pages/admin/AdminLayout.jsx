import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '../../components/layout/Logo.jsx';
import { useAuth } from '../../context/auth-context.js';
import { useLanguage } from '../../context/language-context.js';
import { notificationService } from '../../services/store.service.js';

const navigation = [
  { to: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', labelKey: 'nav.products', icon: Package },
  { to: '/admin/orders', labelKey: 'nav.orders', icon: ShoppingCart },
  { to: '/admin/customers', labelKey: 'nav.customers', icon: Users },
  { to: '/admin/settings', labelKey: 'nav.settings', icon: Settings },
];

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadNotifications() {
      try {
        const data = await notificationService.list(8);
        if (isActive) {
          setNotifications(data.notifications);
          setUnread(data.unread);
        }
      } catch {
        // Notifications are non-critical; keep the dashboard usable.
      }
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);

    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, []);

  function toggleNotifications() {
    setIsNotificationsOpen((current) => !current);
    notificationService
      .list(8)
      .then((data) => {
        setNotifications(data.notifications);
        setUnread(data.unread);
      })
      .catch(() => {});
  }

  function handleNotificationClick(notification) {
    if (!notification.isRead) {
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)),
      );
      setUnread((current) => Math.max(0, current - 1));
      notificationService.markRead(notification._id).catch(() => {});
    }

    if (notification.order) {
      setIsNotificationsOpen(false);
      navigate('/admin/orders');
    }
  }

  async function handleMarkAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnread(0);

    try {
      await notificationService.markAllRead();
    } catch {
      // Keep the optimistic state; the next poll will resync.
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-gold/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 right-0 size-[28rem] rounded-full bg-moss/10 blur-3xl" />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-forest/10 bg-forest-dark text-ivory transition-transform duration-500 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <Logo light />
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="grid size-9 place-items-center rounded-full border border-ivory/15 text-ivory/60 lg:hidden"
              aria-label={t('header.closeMenu')}
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.24em] text-ivory/35">
            {t('nav.studio')}
          </p>

          <nav className="mt-4 space-y-1.5">
            {navigation.map(({ to, labelKey, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-ivory/10 text-ivory'
                      : 'text-ivory/55 hover:bg-ivory/5 hover:text-ivory'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold transition-all duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon className="size-4" aria-hidden="true" />
                    {t(labelKey)}
                    <ArrowUpRight
                      className={`ml-auto size-3.5 transition ${
                        isActive ? 'text-gold' : 'opacity-0 group-hover:opacity-50'
                      }`}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <NavLink
              to="/shop"
              className="flex items-center gap-3 rounded-2xl border border-ivory/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory/60 transition hover:border-gold/40 hover:text-gold"
            >
              <Store className="size-4" aria-hidden="true" />
              {t('nav.storefront')}
            </NavLink>

            <div className="rounded-2xl bg-ivory/5 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-forest-dark">
                  {initialsOf(user?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-[10px] uppercase tracking-[0.12em] text-ivory/40">
                    {t('nav.administrator')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-ivory/15 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/60 transition hover:border-ivory/35 hover:text-ivory"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-forest-dark/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label={t('header.closeMenu')}
        />
      )}

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-forest/10 bg-surface/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest lg:hidden"
                aria-label={t('header.openMenu')}
              >
                <Menu className="size-5" />
              </button>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/35">
                  Beauty Oil Market
                </p>
                <p className="text-sm font-bold text-forest">{t('nav.adminDashboard')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative grid size-10 place-items-center rounded-full border border-forest/15 bg-card text-forest transition hover:border-forest"
                  aria-label={t('header.notifications')}
                  aria-expanded={isNotificationsOpen}
                >
                  <Bell className="size-4" aria-hidden="true" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setIsNotificationsOpen(false)}
                      aria-label={t('header.closeNotifications')}
                    />
                    <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-forest/10 bg-card shadow-2xl">
                      <div className="flex items-center justify-between border-b border-forest/10 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">
                          {t('header.notifications')}
                        </p>
                        {unread > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold uppercase tracking-[0.1em] text-clay transition hover:text-forest"
                          >
                            {t('header.markAllRead')}
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-xs text-ink/40">
                            {t('header.empty')}
                          </p>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification._id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex w-full gap-3 border-b border-forest/5 px-4 py-3 text-left transition hover:bg-sand/30 ${
                                notification.isRead ? '' : 'bg-gold/5'
                              }`}
                            >
                              <span
                                className={`mt-1.5 size-2 shrink-0 rounded-full ${
                                  notification.isRead ? 'bg-forest/15' : 'bg-gold'
                                }`}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-forest">
                                  {notification.title}
                                </span>
                                <span className="mt-0.5 block text-[11px] leading-5 text-ink/50">
                                  {notification.message}
                                </span>
                                <span className="mt-1 block text-[9px] uppercase tracking-[0.1em] text-ink/35">
                                  {new Date(notification.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                {t('header.live')}
              </span>
              <span className="rounded-full border border-forest/10 bg-card px-3 py-1.5 font-mono text-[11px] font-semibold text-forest/70">
                {clock.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
