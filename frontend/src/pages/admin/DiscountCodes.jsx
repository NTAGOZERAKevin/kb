import { useEffect, useState } from 'react';
import { BadgePercent, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { SelectMenu } from '../../components/ui/SelectMenu.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { discountService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const emptyForm = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minSubtotal: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
};

const typeOptions = [
  { value: 'percentage', label: 'Percentage off' },
  { value: 'fixed', label: 'Fixed amount off' },
];

// The date input works in the browser's local timezone, so read the expiry date
// the same way. Slicing the ISO string would shift the day for some timezones.
function toDateInput(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toForm(code) {
  return {
    code: code.code,
    description: code.description,
    type: code.type,
    value: code.value,
    minSubtotal: code.minSubtotal,
    maxUses: code.maxUses ?? '',
    expiresAt: toDateInput(code.expiresAt),
    isActive: code.isActive,
  };
}

function discountLabel(code) {
  if (code.type === 'percentage') {
    return `${code.value}% off`;
  }

  return `${formatCurrency(code.value)} off`;
}

export default function AdminDiscountCodes() {
  useDocumentTitle('Discount codes');

  const [codes, setCodes] = useState([]);
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

    discountService
      .adminList()
      .then((data) => {
        if (isActive) {
          setCodes(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load discount codes.'));
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

  const activeCount = codes.filter((code) => code.isActive).length;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  }

  function openEdit(code) {
    setEditing(code);
    setForm(toForm(code));
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
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minSubtotal: Number(form.minSubtotal || 0),
      maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      expiresAt: form.expiresAt
        ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
        : null,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await discountService.update(editing._id, payload);
        setNotice(`${payload.code} updated.`);
      } else {
        await discountService.create(payload);
        setNotice(`${payload.code} can now be used at checkout.`);
      }
      setIsFormOpen(false);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'We could not save this discount code.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(code) {
    setError('');
    setNotice('');

    try {
      await discountService.update(code._id, { isActive: !code.isActive });
      setNotice(
        `${code.code} is now ${code.isActive ? 'hidden from' : 'available at'} checkout.`,
      );
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not update this discount code.'));
    }
  }

  async function handleDelete(code) {
    if (!window.confirm(`Remove ${code.code}?`)) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await discountService.remove(code._id);
      setNotice(`${code.code} removed.`);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not remove this discount code.'));
    }
  }

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Promotions</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-forest">Discount codes</h1>
          <p className="mt-2 text-sm text-ink/50">
            {activeCount} of {codes.length} code{codes.length === 1 ? '' : 's'} available at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:-translate-y-0.5 hover:bg-forest-light"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add code
        </button>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <Reveal className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-card p-4 text-xs leading-6 text-ink/55">
        <BadgePercent className="mt-0.5 size-4 shrink-0 text-clay" aria-hidden="true" />
        <p>
          Only the owner can create discount codes. Customers enter the code at checkout and the
          discount is recalculated on the server before the order is saved.
        </p>
      </Reveal>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-48 rounded-[1.75rem]" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-forest/20 bg-card px-6 py-16 text-center">
          <p className="font-display text-2xl text-forest">No discount codes yet.</p>
          <p className="mt-2 text-sm text-ink/45">
            Add the first code to give customers a discount at checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {codes.map((code) => {
            const expired = code.expiresAt && new Date(code.expiresAt) < new Date();

            return (
              <article
                key={code._id}
                className="flex flex-col rounded-[1.75rem] border border-forest/10 bg-card p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-mono text-lg font-bold tracking-[0.08em] text-forest">
                      {code.code}
                    </h2>
                    <p className="mt-1 text-xs text-ink/50">
                      {code.description || 'No description'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                      code.isActive && !expired
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-forest/5 text-ink/45'
                    }`}
                  >
                    {!code.isActive ? 'Hidden' : expired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-ink/60 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-forest">{discountLabel(code)}</span>
                  </p>
                  <p>
                    Minimum {formatCurrency(code.minSubtotal)}
                  </p>
                  <p>
                    Used {code.usedCount}
                    {code.maxUses !== null ? ` / ${code.maxUses}` : ''}
                  </p>
                  <p>
                    {code.expiresAt
                      ? `Expires ${new Date(code.expiresAt).toLocaleDateString()}`
                      : 'No expiry date'}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                    Created by {code.createdBy ? 'the owner' : 'the shop'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(code)}
                      className="rounded-full border border-forest/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-forest transition hover:border-forest"
                    >
                      {code.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(code)}
                      className="grid size-9 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest hover:bg-forest hover:text-ivory"
                      aria-label={`Edit ${code.code}`}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(code)}
                      className="grid size-9 place-items-center rounded-full border border-forest/15 text-ink/40 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove ${code.code}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-dark/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                  {editing ? 'Edit code' : 'New code'}
                </p>
                <h2 className="mt-2 break-words font-display text-2xl font-medium leading-tight text-forest sm:text-3xl">
                  {editing ? editing.code : 'Create a discount code'}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="discount-code"
                  name="code"
                  label="Code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. GLOW10"
                  hint="3-24 letters, numbers or dashes"
                  required
                />
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                    Discount type
                  </span>
                  <SelectMenu
                    value={form.type}
                    onChange={(value) => setForm((current) => ({ ...current, type: value }))}
                    options={typeOptions}
                    ariaLabel="Discount type"
                    placeholder="Choose a type"
                  />
                </div>
              </div>

              <InputField
                id="discount-description"
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. 10% off your first order"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="discount-value"
                  name="value"
                  type="number"
                  min="1"
                  max={form.type === 'percentage' ? '100' : undefined}
                  step={form.type === 'percentage' ? '1' : '50'}
                  label={form.type === 'percentage' ? 'Percentage off' : 'Amount off (RWF)'}
                  value={form.value}
                  onChange={handleChange}
                  placeholder={form.type === 'percentage' ? '10' : '2000'}
                  required
                />
                <InputField
                  id="discount-min-subtotal"
                  name="minSubtotal"
                  type="number"
                  min="0"
                  step="500"
                  label="Minimum order (RWF)"
                  value={form.minSubtotal}
                  onChange={handleChange}
                  hint="Use 0 for no minimum"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="discount-max-uses"
                  name="maxUses"
                  type="number"
                  min="1"
                  label="Maximum uses"
                  value={form.maxUses}
                  onChange={handleChange}
                  hint="Leave blank for unlimited"
                />
                <InputField
                  id="discount-expires-at"
                  name="expiresAt"
                  type="date"
                  label="Expires on"
                  value={form.expiresAt}
                  onChange={handleChange}
                  hint="Leave blank for no expiry"
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
                  {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add code'}
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
