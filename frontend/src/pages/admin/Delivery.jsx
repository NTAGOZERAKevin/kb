import { useEffect, useState } from 'react';
import { Clock, MapPin, Pencil, Plus, Trash2, Truck, X } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { FREE_DELIVERY_THRESHOLD } from '../../data/shippingMethods.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { deliveryService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const emptyForm = {
  label: '',
  areas: '',
  eta: '',
  fee: '',
  isActive: true,
};

function toForm(method) {
  return {
    label: method.label,
    areas: method.areas,
    eta: method.eta,
    fee: method.fee,
    isActive: method.isActive,
  };
}

export default function AdminDelivery() {
  useDocumentTitle('Delivery locations');

  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    deliveryService
      .adminList()
      .then((data) => {
        if (isActive) {
          setMethods(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load delivery locations.'));
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

  useEffect(() => {
    if (!isFormOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsFormOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFormOpen]);

  const activeCount = methods.filter((method) => method.isActive).length;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  }

  function openEdit(method) {
    setEditing(method);
    setForm(toForm(method));
    setFormError('');
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');

    const payload = {
      label: form.label,
      areas: form.areas,
      eta: form.eta,
      fee: Number(form.fee),
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await deliveryService.update(editing._id, payload);
        setNotice(`${form.label} updated.`);
      } else {
        await deliveryService.create(payload);
        setNotice(`${form.label} can now be chosen at checkout.`);
      }
      setIsFormOpen(false);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'We could not save this location.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(method) {
    setError('');
    setNotice('');

    try {
      await deliveryService.update(method._id, { isActive: !method.isActive });
      setNotice(
        `${method.label} is now ${method.isActive ? 'hidden from' : 'available at'} checkout.`,
      );
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not update this location.'));
    }
  }

  async function handleDelete(method) {
    if (!window.confirm(`Remove ${method.label} from delivery options?`)) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await deliveryService.remove(method._id);
      setNotice(`${method.label} removed from checkout.`);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not remove this location.'));
    }
  }

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Fulfilment</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-forest">Delivery locations</h1>
          <p className="mt-2 text-sm text-ink/50">
            {activeCount} of {methods.length} location{methods.length === 1 ? '' : 's'} available at
            checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:-translate-y-0.5 hover:bg-forest-light"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add location
        </button>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <Reveal className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-card p-4 text-xs leading-6 text-ink/55">
        <Truck className="mt-0.5 size-4 shrink-0 text-clay" aria-hidden="true" />
        <p>
          Only the owner can change delivery areas and fees. Customers pick one of these locations
          at checkout and the fee is added to their order. Delivery is free on orders over{' '}
          <span className="font-semibold text-forest">{formatCurrency(FREE_DELIVERY_THRESHOLD)}</span>
          , no matter which location is chosen.
        </p>
      </Reveal>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-48 rounded-[1.75rem]" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-forest/20 bg-card px-6 py-16 text-center">
          <p className="font-display text-2xl text-forest">No delivery locations yet.</p>
          <p className="mt-2 text-sm text-ink/45">
            Add the first place you deliver to so customers can check out.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {methods.map((method) => (
            <article
              key={method._id}
              className="flex flex-col rounded-[1.75rem] border border-forest/10 bg-card p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold text-forest">{method.label}</h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/35">
                    {method.value}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                    method.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-forest/5 text-ink/45'
                  }`}
                >
                  {method.isActive ? 'Available' : 'Hidden'}
                </span>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink/60">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-clay" aria-hidden="true" />
                {method.areas}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-ink/60">
                <Clock className="size-3.5 shrink-0 text-clay" aria-hidden="true" />
                {method.eta}
              </p>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-forest/10 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                    Delivery fee
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-forest">
                    {method.fee === 0 ? 'Free' : formatCurrency(method.fee)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(method)}
                    className="rounded-full border border-forest/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-forest transition hover:border-forest"
                  >
                    {method.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(method)}
                    className="grid size-9 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest hover:bg-forest hover:text-ivory"
                    aria-label={`Edit ${method.label}`}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(method)}
                    className="grid size-9 place-items-center rounded-full border border-forest/15 text-ink/40 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${method.label}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-dark/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                  {editing ? 'Edit location' : 'New location'}
                </p>
                <h2 className="mt-2 break-words font-display text-2xl font-medium leading-tight text-forest sm:text-3xl">
                  {editing ? editing.label : 'Where do you deliver?'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-forest/15 text-forest/50 transition hover:text-forest"
                aria-label="Close form"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {formError && <Alert>{formError}</Alert>}

              <InputField
                id="delivery-label"
                name="label"
                label="Location name"
                value={form.label}
                onChange={handleChange}
                placeholder="e.g. Nyarugenge Delivery"
                required
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                  Areas covered
                </span>
                <textarea
                  name="areas"
                  value={form.areas}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Nyarugenge, Nyamirambo, Kigali city centre"
                  required
                  className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="delivery-eta"
                  name="eta"
                  label="Estimated time"
                  value={form.eta}
                  onChange={handleChange}
                  placeholder="e.g. 2–3 hours"
                  required
                />
                <InputField
                  id="delivery-fee"
                  name="fee"
                  type="number"
                  min="0"
                  step="50"
                  label="Delivery fee (RWF)"
                  value={form.fee}
                  onChange={handleChange}
                  hint="Use 0 for free delivery"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-forest">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="size-4 rounded border-forest/30 text-forest focus:ring-gold"
                />
                Available at checkout
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-forest px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add location'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-forest/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-forest transition hover:border-forest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
