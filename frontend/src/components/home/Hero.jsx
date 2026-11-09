import { ArrowDownRight, Leaf, Sparkles, Star } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

const promises = [
  { icon: Leaf, label: 'Plant-powered' },
  { icon: Sparkles, label: 'Small-batch' },
  { icon: Star, label: 'Ritual-worthy' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest text-ivory">
      <div className="pointer-events-none absolute -left-32 top-24 size-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[30rem] rounded-full bg-moss/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#fbf8f2_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="animate-fade-up">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
            <span className="h-px w-8 bg-gold" />
            Rooted in nature. Made for you.
          </p>

          <h1 className="mt-7 max-w-2xl font-display text-5xl font-medium leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[5.4rem]">
            Your skin knows how to{' '}
            <span className="italic text-gold">glow.</span> We simply help it.
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-ivory/65 sm:text-lg">
            Thoughtfully blended botanical oils for skin, hair, and body, made in
            small batches to bring out your healthiest natural radiance.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="#collection" variant="gold" size="lg">
              Shop the collection
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Button>
            <Button href="#story" variant="light" size="lg">
              Our story
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ivory/10 pt-6">
            {promises.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-ivory/50"
              >
                <Icon className="size-3.5 text-gold" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:180ms] lg:max-w-lg">
          <div className="absolute -inset-3 rounded-t-[15rem] rounded-b-[2.5rem] border border-gold/20" />
          <div className="relative overflow-hidden rounded-t-[14rem] rounded-b-[2rem] bg-sand">
            <img
              src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=85"
              alt="Woman enjoying a calm, natural skincare ritual"
              className="aspect-[4/5] size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/45 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <p className="max-w-40 font-display text-xl italic leading-snug text-ivory">
                &ldquo;A little ritual, every day.&rdquo;
              </p>
              <div className="grid size-16 shrink-0 place-items-center rounded-full border border-ivory/25 bg-forest/30 text-center backdrop-blur-md">
                <span className="text-[8px] font-bold uppercase leading-tight tracking-[0.14em] text-ivory/80">
                  100%
                  <br />
                  botanical
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -left-5 top-20 hidden animate-float rounded-2xl bg-surface p-4 text-forest shadow-soft sm:block">
            <div className="flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3 fill-current" aria-hidden="true" />
              ))}
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em]">
              Loved by our community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
