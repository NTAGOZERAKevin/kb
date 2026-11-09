import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../layout/Logo.jsx';

export function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative m-4 hidden min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2.5rem] bg-forest lg:block">
        <img
          src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1400&q=85"
          alt="Botanical skincare bottles in soft natural light"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/35 to-forest-dark/10" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo light />
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
              The Beauty Oil Market ritual
            </p>
            <p className="mt-5 font-display text-4xl font-medium leading-[1.08] text-ivory xl:text-5xl">
              A slower kind of beauty, made from the good stuff.
            </p>
            <p className="mt-5 text-sm leading-7 text-ivory/55">
              Thoughtful botanical oils for everyday moments of care.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-14 lg:py-8">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-forest/60 transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to shop
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink/55">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-7 text-center text-sm text-ink/50">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
