import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { customerService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const statusFilters = [
  { value: 'all', label: 'All customers' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Suspended' },
];

function formatDate(value) {
  if (!value) {
    return 'No orders yet';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAddress(address) {
  if (!address) {
    return 'No delivery address saved';
  }

  return (
    [address.street, address.city, address.district, address.country]
      .filter(Boolean)
      .join(', ') || 'No delivery address saved'
  );
}

export default function AdminCustomers() {
  useDocumentTitle('Customers');

  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    customerService
      .list({ status, q: query, page, limit: 10 })
      .then((data) => {
        if (isActive) {
          setCustomers(data.customers);
          setSummary(data.summary);
          setPagination(data.pagination);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load customers.'));
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
  }, [status, query, page]);

  async function toggleActive(customer) {
    const nextActive = !customer.isActive;
    setUpdatingId(customer._id);
    setError('');
    setNotice('');

    try {
      const updated = await customerService.setActive(customer._id, nextActive);
      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id ? { ...item, isActive: updated.isActive } : item,
        ),
      );
      setSummary((current) => ({
        ...current,
        active: current.active + (nextActive ? 1 : -1),
        inactive: current.inactive + (nextActive ? -1 : 1),
      }));
      setNotice(
        nextActive
          ? `${customer.name} can sign in again.`
          : `${customer.name} has been suspended.`,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not update this customer.'));
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleDetails(customer) {
    const nextId = expandedId === customer._id ? null : customer._id;
    setExpandedId(nextId);

    if (nextId && !details[customer._id]) {
      customerService
        .get(customer._id)
        .then((data) => setDetails((current) => ({ ...current, [customer._id]: data })))
        .catch((requestError) =>
          setError(getErrorMessage(requestError, 'We could not load this customer.')),
        );
    }
  }

  const summaryCards = [
    { label: 'Total customers', value: summary.total, hint: 'Everyone with an account' },
    { label: 'Active', value: summary.active, hint: 'Can sign in and order' },
    { label: 'Suspended', value: summary.inactive, hint: 'Blocked from signing in' },
    { label: 'New this month', value: summary.newThisMonth, hint: 'Created since the 1st' },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Relationships</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-forest">Customer management</h1>
        <p className="mt-2 text-sm text-ink/50">
          {pagination.total} customer{pagination.total === 1 ? '' : 's'} in this view.
        </p>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Reveal
            key={card.label}
            delay={index * 60}
            className="rounded-[1.5rem] border border-forest/10 bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                  {card.label}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-forest">{card.value}</p>
                <p className="mt-1 text-[11px] text-ink/40">{card.hint}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-gold/15 text-clay">
                <Users className="size-4" aria-hidden="true" />
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-forest/10 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setStatus(item.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                status === item.value
                  ? 'bg-forest text-ivory'
                  : 'border border-forest/15 text-forest/55 hover:border-forest/35 hover:text-forest'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative lg:w-72">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, email or phone..."
            className="w-full rounded-full border border-forest/15 bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-forest/10 bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-ink/45">
            No customers match this view.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-left text-sm">
              <thead>
                <tr className="border-b border-forest/10 bg-sand/30 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Spent</th>
                  <th className="px-5 py-4">Last order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => {
                  const isExpanded = expandedId === customer._id;
                  const detail = details[customer._id];

                  return (
                    <CustomerRow
                      key={customer._id}
                      customer={customer}
                      index={index}
                      isExpanded={isExpanded}
                      isUpdating={updatingId === customer._id}
                      detail={detail}
                      onToggleDetails={() => toggleDetails(customer)}
                      onToggleActive={() => toggleActive(customer)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
            className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer, index, isExpanded, isUpdating, detail, onToggleDetails, onToggleActive }) {
  const initials = (customer.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <tr
        className="border-b border-forest/5 transition hover:bg-sand/20"
        style={{ animation: `fade-up 0.45s cubic-bezier(0.22,1,0.36,1) ${index * 40}ms both` }}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest/10 text-xs font-bold text-forest">
              {initials || '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-forest">{customer.name}</p>
              <p className="text-[10px] text-ink/40">
                Joined {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs text-ink/60">
            <Mail className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{customer.email}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-ink/40">
            <Phone className="size-3 shrink-0" aria-hidden="true" />
            {customer.phone || 'No phone'}
          </p>
        </td>
        <td className="px-5 py-4 text-ink/60">{customer.orderCount}</td>
        <td className="px-5 py-4 font-bold text-forest">{formatCurrency(customer.totalSpent)}</td>
        <td className="px-5 py-4 text-xs text-ink/50">{formatDate(customer.lastOrderAt)}</td>
        <td className="px-5 py-4">
          <StatusBadge status={customer.isActive ? 'active' : 'suspended'} />
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onToggleActive}
              disabled={isUpdating}
              className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] transition disabled:opacity-50 ${
                customer.isActive
                  ? 'border-forest/15 text-forest/60 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {isUpdating ? 'Saving...' : customer.isActive ? 'Suspend' : 'Restore'}
            </button>
            <button
              type="button"
              onClick={onToggleDetails}
              className={`grid size-8 place-items-center rounded-full border border-forest/15 text-forest/50 transition hover:text-forest ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-label="Toggle customer details"
              aria-expanded={isExpanded}
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-forest/5 bg-sand/20">
          <td colSpan={7} className="px-5 py-5">
            {!detail ? (
              <div className="skeleton h-24 rounded-2xl" />
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    <MapPin className="size-3" aria-hidden="true" />
                    Delivery address
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink/60">
                    {formatAddress(detail.customer.address)}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-forest/10 bg-card p-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                        Orders
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-forest">
                        {detail.customer.orderCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest/10 bg-card p-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                        Lifetime value
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-forest">
                        {formatCurrency(detail.customer.totalSpent)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink/40">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {detail.customer.isActive
                      ? 'This customer can sign in and place orders.'
                      : 'This customer is suspended and cannot sign in.'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Recent orders
                  </p>
                  {detail.orders.length === 0 ? (
                    <p className="mt-3 text-sm text-ink/45">No orders placed yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {detail.orders.map((order) => (
                        <li
                          key={order._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-forest/10 bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-forest">
                              {order.orderNumber}
                            </p>
                            <p className="text-[10px] text-ink/40">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={order.status} />
                            <span className="text-xs font-bold text-forest">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
