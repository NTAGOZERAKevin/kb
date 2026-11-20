import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { InputField } from '../ui/InputField.jsx';
import { siteConfig } from '../../config/site.js';
import { useAuth } from '../../context/auth-context.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';
import { hasDashboardAccess } from '../../utils/roles.js';

const REMEMBERED_EMAIL_KEY = 'sharon-glow:last-sign-in-email';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readRememberedEmail() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
}

function initialsOf(email = '') {
  return email.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'SG';
}

export function LoginForm({
  idPrefix = 'login',
  redirectTo,
  onSuccess,
  autoFocus = false,
  onSwitchToSignUp,
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const emailRef = useRef(null);

  const rememberedEmail = readRememberedEmail();
  const [form, setForm] = useState({ email: rememberedEmail, password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail));
  const [error, setError] = useState('');
  const [errorHint, setErrorHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usingRememberedAccount = Boolean(rememberedEmail) && form.email === rememberedEmail;
  const isEmailValid = EMAIL_PATTERN.test(form.email.trim());

  useEffect(() => {
    if (rememberedEmail) {
      passwordRef.current?.focus();
    }
  }, [rememberedEmail]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError('');
    setErrorHint(false);
  }

  function handleCapsLock(event) {
    setCapsLockOn(event.getModifierState?.('CapsLock') || false);
  }

  function handleEmailBlur() {
    const email = form.email.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      setFieldErrors((current) => ({
        ...current,
        email: 'That email address does not look complete.',
      }));
    }
  }

  function forgetAccount() {
    setForm({ email: '', password: '' });
    setFieldErrors({});
    setError('');
    setErrorHint(false);
    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    emailRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const email = form.email.trim();

    if (!EMAIL_PATTERN.test(email)) {
      setFieldErrors({
        email: email ? 'That email address does not look complete.' : 'Please enter your email address.',
      });
      emailRef.current?.focus();
      return;
    }

    if (!form.password) {
      setFieldErrors({ password: 'Please enter your password.' });
      passwordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setError('');
    setErrorHint(false);
    setFieldErrors({});

    try {
      const loggedInUser = await login({ email, password: form.password });

      if (rememberEmail) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      const destination =
        typeof redirectTo === 'string' && redirectTo
          ? redirectTo
          : hasDashboardAccess(loggedInUser)
            ? '/admin'
            : '/profile';
      navigate(destination, { replace: true });
      onSuccess?.();
    } catch (requestError) {
      const details = requestError.response?.data?.errors;
      if (details?.length) {
        setFieldErrors(
          Object.fromEntries(details.map((detail) => [detail.field, detail.message])),
        );
      }

      setError(getErrorMessage(requestError, 'We could not sign you in.'));
      setErrorHint(requestError.response?.status === 401);
      passwordRef.current?.focus();
      passwordRef.current?.select();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {usingRememberedAccount && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-3 pr-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest font-display text-sm font-semibold text-ivory">
            {initialsOf(rememberedEmail)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest/50">
              Welcome back
            </p>
            <p className="truncate text-sm font-semibold text-forest">{rememberedEmail}</p>
          </div>
          <button
            type="button"
            onClick={forgetAccount}
            className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest/60 transition hover:bg-forest/5 hover:text-forest"
          >
            Not you?
          </button>
        </div>
      )}

      {error && (
        <Alert>
          {error}
          {errorHint && (
            <span className="mt-1.5 block text-[13px] text-red-700/80">
              Double-check the password, or{' '}
              {onSwitchToSignUp ? (
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="font-bold underline underline-offset-2"
                >
                  create an account
                </button>
              ) : (
                <Link
                  to="/register"
                  onClick={() => onSuccess?.()}
                  className="font-bold underline underline-offset-2"
                >
                  create an account
                </Link>
              )}{' '}
              if this is your first visit. Still stuck?{' '}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-bold underline underline-offset-2"
              >
                Contact us
              </a>
              .
            </span>
          )}
        </Alert>
      )}

      <InputField
        ref={emailRef}
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        icon={Mail}
        value={form.email}
        onChange={handleChange}
        onBlur={handleEmailBlur}
        error={fieldErrors.email}
        autoFocus={autoFocus && !rememberedEmail}
        rightElement={
          isEmailValid && !fieldErrors.email ? (
            <span className="grid size-9 place-items-center text-emerald-600" aria-hidden="true">
              <Check className="size-4" />
            </span>
          ) : null
        }
        required
      />

      <InputField
        ref={passwordRef}
        id={`${idPrefix}-password`}
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        icon={Lock}
        value={form.password}
        onChange={handleChange}
        onKeyDown={handleCapsLock}
        onKeyUp={handleCapsLock}
        onBlur={() => setCapsLockOn(false)}
        error={fieldErrors.password}
        hint={
          capsLockOn ? (
            <span className="flex items-center gap-1.5 font-semibold text-clay">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Caps Lock is on
            </span>
          ) : undefined
        }
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="grid size-9 place-items-center rounded-full text-forest/40 transition hover:bg-forest/5 hover:text-forest"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-medium text-ink/60">
          <span className="relative grid place-items-center">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(event) => setRememberEmail(event.target.checked)}
              className="peer size-4 appearance-none rounded-md border border-forest/25 bg-card transition checked:border-forest checked:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
            <Check
              className="pointer-events-none absolute size-3 text-ivory opacity-0 transition peer-checked:opacity-100"
              aria-hidden="true"
            />
          </span>
          Remember me
        </label>

        <a
          href={`mailto:${siteConfig.email}?subject=Password%20reset%20request`}
          className="text-xs font-bold text-clay underline-offset-4 transition hover:text-forest hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" size="lg" className="group w-full" isLoading={isSubmitting}>
        {isSubmitting ? 'Signing you in...' : 'Sign in'}
        {!isSubmitting && (
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        )}
      </Button>

      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-ink/40">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-gold" aria-hidden="true" />
          Secure sign-in
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
          Your cart follows you
        </span>
      </p>
    </form>
  );
}
