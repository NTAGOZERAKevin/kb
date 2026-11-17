import { useEffect, useState } from 'react';
import { KeyRound, Mail, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { useAuth } from '../../context/auth-context.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { adminService } from '../../services/store.service.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const emptyForm = { name: '', email: '', password: '' };

function formatDate(value) {
  if (!value) {
    return 'Unknown';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

export default function AdminTeam() {
  useDocumentTitle('Team Access');

  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    adminService
      .list()
      .then((data) => {
        if (isActive) {
          setAdmins(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load admin accounts.'));
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

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');
    setNotice('');

    try {
      const admin = await adminService.create(form);
      setNotice(`${admin.name} can now sign in and manage the business.`);
      setForm(emptyForm);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'We could not create this admin account.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(admin) {
    const confirmed = window.confirm(
      `Remove ${admin.name}'s admin access?\n\nThey will no longer be able to sign in to the dashboard.`,
    );

    if (!confirmed) {
      return;
    }

    setRemovingId(admin._id);
    setError('');
    setNotice('');

    try {
      const message = await adminService.remove(admin._id);
      setNotice(message);
      setAdmins((current) => current.filter((item) => item._id !== admin._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not remove this admin account.'));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Access</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-forest">Team access</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/50">
          Only you, the owner, can give someone dashboard access. Admins manage products, orders,
          customers and payments, but they cannot add or remove other admins.
        </p>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="rounded-[1.75rem] border border-forest/10 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium text-forest">People with access</h2>
              <p className="text-xs text-ink/45">{admins.length} admin account{admins.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <li key={index} className="skeleton h-16 rounded-2xl" />
                ))
              : admins.map((admin) => {
                  const isSelf = admin._id === user?._id;

                  return (
                    <li
                      key={admin._id}
                      className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-surface px-4 py-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-xs font-bold text-ivory">
                        {initialsOf(admin.name) || '?'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-forest">
                          {admin.name}
                          {admin.role === 'owner' && (
                            <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-forest">
                              Owner
                            </span>
                          )}
                          {isSelf && (
                            <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-clay">
                              You
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-ink/45">{admin.email}</p>
                        <p className="mt-0.5 text-[10px] text-ink/35">
                          Added {formatDate(admin.createdAt)}
                        </p>
                      </div>
                      {!isSelf && admin.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => handleRemove(admin)}
                          disabled={removingId === admin._id}
                          className="grid size-9 shrink-0 place-items-center rounded-full border border-forest/15 text-ink/40 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          aria-label={`Remove admin access for ${admin.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
          </ul>
        </Reveal>

        <Reveal delay={100} className="rounded-[1.75rem] border border-forest/10 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <UserPlus className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium text-forest">Add an admin</h2>
              <p className="text-xs text-ink/45">They can sign in as soon as you save.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {formError && <Alert>{formError}</Alert>}

            <InputField
              id="admin-name"
              name="name"
              label="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <InputField
              id="admin-email"
              name="email"
              type="email"
              label="Email address"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
            <InputField
              id="admin-password"
              name="password"
              type="password"
              label="Temporary password"
              icon={KeyRound}
              value={form.password}
              onChange={handleChange}
              hint="8+ characters with uppercase, lowercase, and a number"
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-full bg-forest px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
            >
              {isSaving ? 'Creating access...' : 'Give admin access'}
            </button>
            <p className="flex items-start gap-2 text-[11px] leading-5 text-ink/40">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Share the password with them privately. They can change it later in Settings.
            </p>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
