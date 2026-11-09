import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { orderService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
const editableStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

export default function AdminOrders() {
  useDocumentTitle('Manage Orders');

  const [orders, setOrders] = useState([]);
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

    orderService
      .adminList({ status, q: query, page, limit: 10 })
      .then((data) => {
        if (isActive) {
          setOrders(data.orders);
          setPagination(data.pagination);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load orders.'));
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

  async function handleStatusChange(order, nextStatus) {
    setUpdatingId(order._id);
    setError('');
    setNotice('');

    try {
      const updated = await orderService.updateStatus(order._id, nextStatus);
      setOrders((current) =>
        current.map((item) => (item._id === order._id ? { ...item, ...updated } : item)),
      );
      setNotice(`${order.orderNumber} marked as ${nextStatus}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not update this order.'));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleConfirmPayment(order) {
    setUpdatingId(order._id);
    setError('');
    setNotice('');

    try {
      const updated = await orderService.confirmPayment(order._id);
      setOrders((current) =>
        current.map((item) => (item._id === order._id ? { ...item, ...updated } : item)),
      );
      setNotice(`Payment confirmed for ${order.orderNumber}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not confirm this payment.'));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Operations</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-forest">Order management</h1>
        <p className="mt-2 text-sm text-ink/50">
          {pagination.total} order{pagination.total === 1 ? '' : 's'} in this view.
        </p>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-forest/10 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                status === item
                  ? 'bg-forest text-ivory'
                  : 'border border-forest/15 text-forest/55 hover:border-forest/35 hover:text-forest'
              }`}
            >
              {item}
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
            placeholder="Order number, name, email..."
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
        ) : orders.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-ink/45">No orders match this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead>
                <tr className="border-b border-forest/10 bg-sand/30 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    index={index}
                    isUpdating={updatingId === order._id}
                    isExpanded={expandedId === order._id}
                    onToggle={() =>
                      setExpandedId((current) => (current === order._id ? null : order._id))
                    }
                    onStatusChange={handleStatusChange}
                    onConfirmPayment={handleConfirmPayment}
                  />
                ))}
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

function OrderRow({
  order,
  index,
  isUpdating,
  isExpanded,
  onToggle,
  onStatusChange,
  onConfirmPayment,
}) {
  return (
    <>
      <tr
        className="border-b border-forest/5 transition hover:bg-sand/20"
        style={{ animation: `fade-up 0.45s cubic-bezier(0.22,1,0.36,1) ${index * 40}ms both` }}
      >
        <td className="px-5 py-4">
          <p className="font-semibold text-forest">{order.orderNumber}</p>
          <p className="text-[10px] text-ink/40">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </td>
        <td className="px-5 py-4">
          <p className="font-semibold text-forest">{order.customer?.name || order.user?.name}</p>
          <p className="text-[10px] text-ink/40">{order.customer?.email || order.user?.email}</p>
        </td>
        <td className="px-5 py-4 text-ink/60">{order.items.length}</td>
        <td className="px-5 py-4 font-bold text-forest">{formatCurrency(order.total)}</td>
        <td className="px-5 py-4">
          <StatusBadge status={order.paymentStatus} />
          <p className="mt-1 text-[10px] capitalize text-ink/40">
            {order.paymentMethod.replaceAll('_', ' ')}
          </p>
        </td>
        <td className="px-5 py-4">
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(event) => onStatusChange(order, event.target.value)}
            className="rounded-full border border-forest/15 bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-forest outline-none focus:border-gold disabled:opacity-50"
          >
            {editableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </td>
        <td className="px-5 py-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            className={`grid size-8 place-items-center rounded-full border border-forest/15 text-forest/50 transition hover:text-forest ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-label="Toggle order details"
            aria-expanded={isExpanded}
          >
            <ChevronDown className="size-4" />
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-forest/5 bg-sand/20">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                  Items
                </p>
                <ul className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.product} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                      <span className="flex-1 text-sm text-forest">{item.name}</span>
                      <span className="text-xs text-ink/45">
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                  Delivery
                </p>
                <p className="mt-3 text-sm leading-6 text-ink/60">
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                  {order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}
                  <br />
                  {order.shippingAddress.country}
                  <br />
                  {order.customer.phone || 'No phone provided'}
                </p>
                {order.notes && (
                  <p className="mt-3 rounded-xl bg-card p-3 text-xs text-ink/50">
                    Note: {order.notes}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-forest/10 bg-card p-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                      Payment
                    </p>
                    <p className="mt-1 text-xs font-semibold capitalize text-forest">
                      {order.paymentStatus} · {order.paymentMethod.replaceAll('_', ' ')}
                    </p>
                    {order.paymentReference && (
                      <p className="mt-1 truncate font-mono text-[10px] text-ink/45">
                        {order.paymentReference}
                      </p>
                    )}
                  </div>
                  {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onConfirmPayment(order)}
                      className="shrink-0 rounded-full bg-forest px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-50"
                    >
                      Confirm payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
