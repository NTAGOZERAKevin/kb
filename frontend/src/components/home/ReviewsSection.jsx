import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { testimonials } from '../../data/homeContent.js';
import { Reveal } from '../ui/Reveal.jsx';

const averageRating = '4.9';

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = testimonials[index];

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused]);

  function go(direction) {
    setIndex(
      (current) => (current + direction + testimonials.length) % testimonials.length,
    );
  }

  return (
    <section
      id="reviews"
      className="relative scroll-mt-28 overflow-hidden bg-forest py-20 text-ivory lg:py-28"
    >
      <div className="pointer-events-none absolute -right-28 top-0 size-[26rem] rounded-full bg-gold/15 blur-[100px] animate-aurora" />
      <div className="pointer-events-none absolute -left-24 bottom-[-6rem] size-[22rem] rounded-full bg-moss/30 blur-[100px] animate-aurora [animation-delay:-9s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
              From our community
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-medium leading-tight sm:text-5xl">
              Real rituals. Real glow.
            </h2>
          </Reveal>
          <Reveal delay={120} className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/45">
                {averageRating} average · 120+ reviews
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal
          delay={160}
          className="mt-12"
        >
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            className="relative overflow-hidden rounded-[2.5rem] border border-ivory/10 bg-ivory/[0.04] backdrop-blur-sm"
            aria-roledescription="carousel"
            aria-label="Customer reviews"
          >
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-48 overflow-hidden bg-forest-dark/40 lg:min-h-full">
                <img
                  src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80"
                  alt="Botanical oil ritual"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-7">
                  <Quote className="size-10 text-gold/70" strokeWidth={1.2} aria-hidden="true" />
                  <p className="mt-4 max-w-xs font-display text-2xl italic leading-snug text-ivory/90">
                    &ldquo;The little moments our customers look forward to.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-10">
                <div key={active.name} className="animate-fade-up">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="size-3.5 fill-current"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <blockquote className="mt-6 font-display text-2xl leading-relaxed text-ivory/90 sm:text-3xl">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                  <div className="mt-7 flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold to-clay text-[11px] font-bold text-forest-dark">
                      {initials(active.name)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ivory">{active.name}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/35">
                        {active.detail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-ivory/10 pt-5">
                  <div className="flex items-center gap-2" role="tablist" aria-label="Choose review">
                    {testimonials.map((testimonial, dotIndex) => (
                      <button
                        key={testimonial.name}
                        type="button"
                        role="tab"
                        aria-selected={dotIndex === index}
                        aria-label={`Review from ${testimonial.name}`}
                        onClick={() => setIndex(dotIndex)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          dotIndex === index
                            ? 'w-8 bg-gold'
                            : 'w-3 bg-ivory/25 hover:bg-ivory/50'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Previous review"
                      className="grid size-10 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-gold hover:bg-gold hover:text-forest-dark"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Next review"
                      className="grid size-10 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-gold hover:bg-gold hover:text-forest-dark"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={220} className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { value: '98%', label: 'Would recommend to a friend' },
            { value: '1–2 min', label: 'Average absorption time' },
            { value: '24h', label: 'Support reply time' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] px-5 py-4 transition duration-300 hover:border-gold/30 hover:bg-ivory/[0.06]"
            >
              <p className="font-display text-2xl font-semibold text-gold">{stat.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/40">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
