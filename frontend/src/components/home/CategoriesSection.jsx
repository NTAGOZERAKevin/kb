import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '../../data/homeContent.js';
import { Reveal } from '../ui/Reveal.jsx';
import { useTilt } from '../../hooks/useTilt.js';

function CategoryCard({ category, index }) {
  const tiltProps = useTilt({ max: 5, scale: 1.015, spotlight: true });

  return (
    <Reveal delay={index * 110} className="h-full">
      <Link
        to={`/shop?category=${encodeURIComponent(category.name)}`}
        className={`group block h-full ${index === 1 ? 'md:translate-y-8' : ''}`}
        aria-label={`Shop ${category.name}`}
      >
        <article
          {...tiltProps}
          className="spotlight-card relative min-h-[20rem] overflow-hidden rounded-[2rem] bg-forest transition-transform duration-300 ease-out will-change-transform sm:min-h-[26rem] md:min-h-[30rem]"
        >
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/30 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-gold/40" />

          <div className="relative flex h-full min-h-[20rem] flex-col justify-between p-7 sm:min-h-[26rem] md:min-h-[30rem]">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                0{index + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-full border border-ivory/25 bg-forest-dark/40 text-ivory backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-forest-dark">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>

            <div>
              <h3 className="font-display text-3xl font-medium text-ivory sm:text-4xl">
                {category.name}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-ivory/70">
                {category.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                <span className="h-px w-6 bg-gold transition-all duration-300 group-hover:w-12" />
                Shop the ritual
              </span>
            </div>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
            A ritual for every part of you
          </p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.05] text-forest sm:text-5xl">
            Everyday care, elevated by nature.
          </h2>
        </Reveal>
        <Reveal
          delay={120}
          as="p"
          className="max-w-md text-sm leading-7 text-ink/55 lg:justify-self-end"
        >
          Simple, considered formulas that turn a few quiet minutes into something you
          look forward to. Move your cursor over each ritual to explore it.
        </Reveal>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-5">
        {categories.map((category, index) => (
          <CategoryCard key={category.name} category={category} index={index} />
        ))}
      </div>
    </section>
  );
}
