import { Leaf, Sparkles, Sun } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber.jsx';
import { Reveal } from '../ui/Reveal.jsx';

const values = [
  {
    icon: Leaf,
    title: 'Short ingredient lists',
    description: 'Only botanicals we can name, pronounce, and explain.',
  },
  {
    icon: Sparkles,
    title: 'Blended in small batches',
    description: 'Freshly made in limited quantities, never mass produced.',
  },
  {
    icon: Sun,
    title: 'Made for real rituals',
    description: 'Simple steps that fit into a busy, everyday life.',
  },
];

const milestones = [
  { value: 100, suffix: '%', label: 'Botanical oils' },
  { value: 12, suffix: '', label: 'Signature blends' },
  { value: 2400, suffix: '+', label: 'Rituals delivered' },
];

export function StorySection() {
  return (
    <section id="story" className="relative scroll-mt-28 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 size-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-8 lg:py-28">
        <div className="relative order-2 lg:order-1">
          <Reveal className="relative">
            <div className="group relative overflow-hidden rounded-[2.5rem]">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"
                alt="Botanical ingredients and beauty oils prepared by hand"
                loading="lazy"
                className="aspect-[4/5] size-full object-cover transition duration-[1.4s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/40 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-7 -right-2 w-40 overflow-hidden rounded-[1.5rem] border-4 border-surface shadow-soft sm:-right-8 sm:w-48">
              <img
                src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80"
                alt="A finished bottle of botanical body oil"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="absolute left-3 top-8 grid size-24 place-items-center rounded-full border border-forest/10 bg-surface/95 shadow-soft backdrop-blur sm:-left-2">
              <div className="relative grid size-full place-items-center">
                <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow">
                  <defs>
                    <path
                      id="story-badge-circle"
                      d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                    />
                  </defs>
                  <text className="fill-forest/70 text-[8.5px] font-bold uppercase">
                    <textPath href="#story-badge-circle">
                      Hand blended · Kigali · Since 2019 ·
                    </textPath>
                  </text>
                </svg>
                <Leaf className="size-5 text-clay" aria-hidden="true" />
              </div>
            </div>

            <div className="absolute -bottom-6 left-4 max-w-40 rounded-[1.25rem] border border-forest/10 bg-surface/95 p-4 text-forest shadow-soft backdrop-blur sm:left-0">
              <p className="font-display text-lg italic leading-snug">
                &ldquo;Slow beauty, made by hand.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
              Our story
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-medium leading-[1.05] text-forest sm:text-5xl lg:text-6xl">
              Made slowly. Made with intention.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-ink/60">
              Sharon Glow Boutique began with a simple belief: the best beauty rituals feel
              personal, gentle, and rooted in nature. We blend plant-powered oils that
              bring you back to yourself, one quiet moment at a time.
            </p>
            <p className="mt-4 max-w-lg text-base leading-8 text-ink/60">
              No complicated routines. No unnecessary promises. Just beautiful,
              effective nourishment for your skin, hair, and body.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-3">
            {values.map(({ icon: Icon, title, description }, index) => (
              <Reveal
                key={title}
                delay={100 + index * 90}
                className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition duration-300 hover:border-forest/10 hover:bg-card hover:shadow-[0_18px_40px_-32px_rgba(34,4,33,0.6)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-clay transition duration-300 group-hover:bg-forest group-hover:text-gold">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-forest">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/50">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal
            delay={200}
            className="mt-9 grid max-w-md grid-cols-3 gap-2 border-t border-forest/10 pt-7 sm:gap-4"
          >
            {milestones.map((milestone) => (
              <div key={milestone.label}>
                <p className="font-display text-2xl font-semibold text-forest">
                  <AnimatedNumber value={milestone.value} />
                  <span className="text-clay">{milestone.suffix}</span>
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink/40 sm:tracking-[0.12em]">
                  {milestone.label}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
