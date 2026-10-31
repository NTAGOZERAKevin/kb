import { Quote, Star } from 'lucide-react';
import { testimonials } from '../../data/homeContent.js';

export function ReviewsSection() {
  return (
    <section id="reviews" className="scroll-mt-28 bg-forest py-20 text-ivory lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
            From our community
          </p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">
            Real rituals. Real glow.
          </h2>
          <p className="mt-5 text-sm leading-7 text-ivory/55">
            The little moments our customers look forward to, in their own words.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <figure
              key={testimonial.name}
              className={`relative rounded-[2rem] border border-ivory/10 p-7 ${
                index === 1 ? 'bg-ivory/[0.07]' : 'bg-ivory/[0.035]'
              }`}
            >
              <Quote
                className="size-8 text-gold/60"
                strokeWidth={1.2}
                aria-hidden="true"
              />
              <div className="mt-5 flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="size-3.5 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-xl leading-relaxed text-ivory/85">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-ivory/10 pt-5">
                <p className="text-sm font-bold text-ivory">{testimonial.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/35">
                  {testimonial.detail}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
