import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useAuthModal } from '../../context/auth-modal-context.js';
import { Button } from '../ui/Button.jsx';
import { Reveal } from '../ui/Reveal.jsx';

const avatars = ['CM', 'DU', 'AK', 'GN'];

export function HomeCta() {
  const { openSignup } = useAuthModal();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-clay via-[#7c1f5e] to-clay px-6 py-16 text-center sm:px-12 lg:py-20">
          <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-gold/30 blur-3xl animate-aurora" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-ivory/15 blur-3xl animate-aurora [animation-delay:-7s]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fdf8f6_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="pointer-events-none absolute -left-10 top-16 hidden rounded-2xl border border-ivory/20 bg-ivory/10 p-3 backdrop-blur-md sm:block animate-float-slow">
            <div className="flex items-center gap-1 text-gold-light">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3 fill-current" aria-hidden="true" />
              ))}
            </div>
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory/70">
              4.9 average rating
            </p>
          </div>

          <div className="pointer-events-none absolute right-8 top-10 hidden size-24 place-items-center rounded-full border border-ivory/20 bg-ivory/10 backdrop-blur-md sm:grid">
            <span className="text-center text-[8px] font-bold uppercase leading-tight tracking-[0.16em] text-ivory/75">
              Free
              <br />
              delivery
              <br />
              over 50k
            </span>
          </div>

          <p className="relative inline-flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ivory/80 backdrop-blur-sm">
            <Sparkles className="size-3.5 animate-float" aria-hidden="true" />
            Your daily dose of glow
          </p>
          <h2 className="relative mx-auto mt-6 max-w-2xl font-display text-4xl font-medium leading-tight text-ivory sm:text-5xl lg:text-6xl">
            Make space for a little more{' '}
            <span className="italic text-gold-light">softness.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-sm leading-7 text-ivory/75 sm:text-base">
            Create an account to save your favourite rituals, follow your orders, and make
            checkout effortless.
          </p>

          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              variant="gold"
              size="lg"
              className="shine-hover"
              onClick={() => openSignup()}
            >
              Create your account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to="/shop" variant="light" size="lg">
              Browse the collection
            </Button>
          </div>

          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="flex -space-x-2.5">
              {avatars.map((initials, index) => (
                <span
                  key={initials}
                  className="grid size-8 place-items-center rounded-full border-2 border-clay bg-ivory text-[9px] font-bold text-forest"
                  style={{ zIndex: avatars.length - index }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/60">
              Join 2,400+ people building their ritual
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
