import { useEffect, useId, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { BrandMark } from '../layout/Logo.jsx';
import { LoginForm } from './LoginForm.jsx';
import { SignUpForm } from './SignUpForm.jsx';

/**
 * Split sign-in card: the plum ritual panel on the left, the form on the right.
 * Used both by the global sign-in modal and by the /admin gate.
 */
export function SignInCard({
  eyebrow = 'The Sharon Glow ritual',
  heading = 'Welcome Back!',
  subheading = 'Sign in to continue to your account',
  signUpHeading = 'Create your account',
  signUpSubheading = 'A little more ease, a little more glow — start by telling us who you are.',
  idPrefix = 'sign-in',
  redirectTo,
  onSuccess,
  onClose,
  closeLabel = 'Close sign in',
  footer,
  autoFocus = false,
  allowSignUp = true,
  initialMode = 'signin',
}) {
  const swirlId = useId();
  const [mode, setMode] = useState(initialMode);
  const isSignUp = mode === 'signup';

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-title`}
      className="relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-card shadow-[0_40px_120px_-28px_rgba(20,2,20,0.75)] md:grid md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]"
    >
      {/* Ritual panel */}
      <aside className="relative hidden overflow-hidden bg-forest-dark md:flex md:flex-col md:justify-between md:p-9 lg:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(130%_120%_at_20%_0%,#5a1858_0%,#3c0b3d_50%,#220421_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-16 -top-20 size-64 rounded-full bg-clay/25 blur-3xl animate-aurora"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-16 size-72 rounded-full bg-gold/20 blur-3xl animate-aurora [animation-duration:24s]"
        />

        {/* Gold swirl at the foot of the panel */}
        <svg
          viewBox="0 0 320 200"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -left-10 w-64 opacity-80"
        >
          <defs>
            <linearGradient id={swirlId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7e3b3" />
              <stop offset="45%" stopColor="#d9a63c" />
              <stop offset="100%" stopColor="#8d6415" />
            </linearGradient>
          </defs>
          <path
            d="M-30 172C50 132 108 196 178 156S296 92 350 128"
            fill="none"
            stroke={`url(#${swirlId})`}
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M-30 186C56 150 116 206 188 170S300 112 350 146"
            fill="none"
            stroke={`url(#${swirlId})`}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        <div className="relative flex items-center gap-2">
          <Sparkles className="size-3.5 text-gold animate-pulse" aria-hidden="true" />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">{eyebrow}</p>
        </div>

        <div className="relative flex flex-col items-center py-8 text-center">
          <div className="relative grid size-44 place-items-center lg:size-52">
            <span aria-hidden="true" className="absolute inset-0 rounded-full border border-gold/25" />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-dashed border-gold/35 animate-spin-slow [animation-duration:34s]"
            />
            <span aria-hidden="true" className="absolute inset-6 rounded-full bg-ivory/5 blur-md" />
            <span
              aria-hidden="true"
              className="absolute inset-8 rounded-full bg-gold/15 blur-xl animate-aurora"
            />
            <span aria-hidden="true" className="absolute inset-0 animate-spin-slow [animation-duration:18s]">
              <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_3px_rgba(217,166,60,0.5)]" />
            </span>
            <BrandMark className="relative h-28 w-auto animate-float drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] lg:h-32" />
          </div>

          <p className="mt-4 animate-gradient bg-gradient-to-r from-gold via-[#f7e3b3] to-gold bg-clip-text font-display text-base font-semibold tracking-tight text-transparent">
            Sharon Glow Boutique
          </p>
          <span
            aria-hidden="true"
            className="mt-2 block h-px w-16 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          />
        </div>

        <p className="relative max-w-[16rem] font-display text-[1.7rem] font-medium leading-[1.15] text-ivory lg:text-[1.95rem]">
          A slower kind of beauty, made from the{' '}
          <span className="italic text-gold-light">good stuff.</span>
        </p>
      </aside>

      {/* Form panel */}
      <div className="relative p-6 sm:p-8 md:p-10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-forest text-ivory/80 transition hover:bg-forest-light hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:right-5 md:top-5"
            aria-label={closeLabel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}

        {/* Heading sits clear of the close button, with its own gold rule. */}
        <div className="flex flex-col items-center px-2 pt-2 text-center sm:px-0 md:pt-8">
          <div className="relative mb-4 grid size-12 place-items-center md:hidden">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-dashed border-gold/40 animate-spin-slow"
            />
            <BrandMark className="h-9 w-auto animate-float" />
          </div>

          <h2
            id={`${idPrefix}-title`}
            className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-forest sm:text-[2.3rem]"
          >
            {isSignUp ? signUpHeading : heading}
          </h2>
          <span
            aria-hidden="true"
            className="mt-3 block h-[2px] w-14 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent"
          />
          <p className="mt-3 max-w-[19rem] text-sm leading-6 text-ink/60">
            {isSignUp ? signUpSubheading : subheading}
          </p>
        </div>

        <div className="mt-8">
          {isSignUp ? (
            <SignUpForm
              idPrefix={`${idPrefix}-signup`}
              redirectTo={redirectTo}
              onSuccess={onSuccess}
            />
          ) : (
            <LoginForm
              idPrefix={idPrefix}
              redirectTo={redirectTo}
              onSuccess={onSuccess}
              autoFocus={autoFocus}
              onSwitchToSignUp={allowSignUp ? () => setMode('signup') : undefined}
            />
          )}
        </div>

        {allowSignUp && (
          <p className="mt-6 border-t border-forest/10 pt-5 text-center text-sm text-ink/55">
            {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
              className="font-bold text-clay underline-offset-4 transition hover:text-forest hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        )}

        {footer && (
          <div
            className={`text-center text-sm text-ink/55 ${
              allowSignUp ? 'mt-3' : 'mt-6 border-t border-forest/10 pt-5'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}
