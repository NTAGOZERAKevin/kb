import { ArrowLeft, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark, Logo } from '../layout/Logo.jsx';

const memberBenefits = [
  {
    icon: Sparkles,
    title: 'Early access to small-batch drops',
    copy: 'New oils and limited rituals before anyone else.',
  },
  {
    icon: Package,
    title: 'Delivery details saved for you',
    copy: 'Checkout in seconds with your address on file.',
  },
  {
    icon: ShieldCheck,
    title: 'Your orders, tracked in one place',
    copy: 'Follow every ritual from bag to doorstep.',
  },
];

export function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-surface">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-48 size-[36rem] rounded-full bg-clay/15 blur-3xl" />
        <div className="absolute -right-32 top-1/4 size-[32rem] rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-56 left-1/3 size-[34rem] rounded-full bg-forest/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(60,11,61,0.07)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Logo />
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-forest/15 bg-card/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-forest/70 backdrop-blur transition hover:border-forest/30 hover:text-forest"
        >
          <ArrowLeft
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to shop
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-16 lg:pb-16">
        <section className="mx-auto w-full max-w-[27rem]">
          <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-card/85 p-6 shadow-[0_30px_90px_-45px_rgba(34,4,33,0.55)] backdrop-blur-xl sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            />

            <div className="flex flex-col items-center text-center">
              <div className="relative grid size-16 place-items-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-dashed border-gold/50 animate-spin-slow"
                />
                <span aria-hidden="true" className="absolute inset-1.5 rounded-full bg-gold/10" />
                <BrandMark className="relative h-10 w-auto animate-float" />
              </div>

              <p className="mt-3 animate-gradient bg-gradient-to-r from-gold via-[#f7e3b3] to-gold bg-clip-text font-display text-base font-semibold tracking-tight text-transparent">
                Sharon Glow Boutique
              </p>
              <span
                aria-hidden="true"
                className="mt-2 block h-px w-14 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
              />

              <div className="mt-5 flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
                  {eyebrow}
                </p>
              </div>
              <h1 className="mt-3 font-display text-[2.05rem] font-medium leading-[1.08] text-forest sm:text-[2.45rem]">
                {title}
              </h1>
              <p className="mt-3.5 text-sm leading-7 text-ink/55">{subtitle}</p>
            </div>

            <div className="mt-7">{children}</div>

            {footer && (
              <div className="mt-6 border-t border-forest/10 pt-5 text-center text-sm text-ink/55">
                {footer}
              </div>
            )}
          </div>
        </section>

        <aside className="relative hidden min-h-[35rem] overflow-hidden rounded-[2.5rem] bg-forest-dark shadow-[0_40px_100px_-50px_rgba(34,4,33,0.7)] lg:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_120%_at_18%_0%,#5a1858_0%,#3c0b3d_48%,#220421_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 size-72 rounded-full bg-gold/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 size-80 rounded-full bg-clay/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-[2rem] border border-ivory/10"
          />

          <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
                <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
                The Sharon Glow ritual
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
            </div>

            <div className="flex flex-col items-center py-8">
              <div className="relative grid size-52 place-items-center">
                <span aria-hidden="true" className="absolute inset-0 rounded-full border border-gold/25" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-dashed border-gold/30 animate-spin-slow [animation-duration:32s]"
                />
                <span aria-hidden="true" className="absolute inset-7 rounded-full border border-gold/15" />
                <span
                  aria-hidden="true"
                  className="absolute inset-12 rounded-full bg-ivory/5 blur-md"
                />

                {/* orbiting sparks */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-spin-slow [animation-duration:16s]"
                >
                  <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_3px_rgba(217,166,60,0.55)]" />
                  <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-clay" />
                </span>

                <span
                  aria-hidden="true"
                  className="absolute inset-10 rounded-full bg-gold/10 blur-xl animate-aurora"
                />
                <BrandMark className="relative h-32 w-auto animate-float drop-shadow-[0_20px_34px_rgba(0,0,0,0.4)]" />
              </div>

              <p className="mt-5 animate-gradient bg-gradient-to-r from-gold via-[#f7e3b3] to-gold bg-clip-text font-display text-xl font-semibold tracking-tight text-transparent">
                Sharon Glow Boutique
              </p>
              <span
                aria-hidden="true"
                className="mt-2 block h-px w-20 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
              />
              <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-ivory/35">
                Skincare, made slowly
              </p>
            </div>

            <div>
              <p className="max-w-sm font-display text-3xl font-medium leading-[1.12] text-ivory xl:text-4xl">
                A slower kind of beauty, made from the good stuff.
              </p>

              <ul className="mt-7 grid gap-2.5">
                {memberBenefits.map((benefit) => (
                  <li
                    key={benefit.title}
                    className="flex items-center gap-3 rounded-2xl border border-ivory/10 bg-ivory/[0.06] px-4 py-3 backdrop-blur-sm"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                      <benefit.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ivory/90">{benefit.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-ivory/45">{benefit.copy}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
