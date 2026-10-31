import { Check } from 'lucide-react';

const values = [
  'Short ingredient lists you can understand',
  'Small batches blended with care',
  'Formulas made for real, everyday rituals',
];

export function StorySection() {
  return (
    <section id="story" className="scroll-mt-28 overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-8 lg:py-28">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-[2.5rem]">
            <img
              src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"
              alt="Botanical ingredients and beauty oils prepared by hand"
              loading="lazy"
              className="aspect-[4/5] size-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -right-3 max-w-48 rounded-[1.5rem] border border-forest/10 bg-ivory p-5 shadow-soft sm:-right-8">
            <p className="font-display text-3xl font-semibold text-forest">Small batch</p>
            <p className="mt-1 text-xs leading-5 text-ink/50">
              Blended in limited quantities for freshness and care.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
            Our story
          </p>
          <h2 className="mt-4 max-w-lg font-display text-4xl font-medium leading-[1.05] text-forest sm:text-5xl lg:text-6xl">
            Made slowly. Made with intention.
          </h2>
          <p className="mt-7 max-w-lg text-base leading-8 text-ink/60">
            Beauty Oil Market began with a simple belief: the best beauty rituals feel
            personal, gentle, and rooted in nature. We blend plant-powered oils that bring
            you back to yourself, one quiet moment at a time.
          </p>
          <p className="mt-4 max-w-lg text-base leading-8 text-ink/60">
            No complicated routines. No unnecessary promises. Just beautiful, effective
            nourishment for your skin, hair, and body.
          </p>

          <ul className="mt-8 space-y-4">
            {values.map((value) => (
              <li key={value} className="flex items-center gap-3 text-sm text-forest/80">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                {value}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-forest/10 pt-7">
            <div>
              <p className="font-display text-2xl font-semibold text-forest">100%</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Botanical oils
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-forest">Rwanda</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Made locally
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-forest">Daily</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Ritual ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
