import { categories } from '../../data/homeContent.js';

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
            A ritual for every part of you
          </p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.05] text-forest sm:text-5xl">
            Everyday care, elevated by nature.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-ink/55 lg:justify-self-end">
          Simple, considered formulas that turn a few quiet minutes into something you
          look forward to.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {categories.map((category, index) => (
          <article
            key={category.name}
            className="group relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-forest"
          >
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                0{index + 1}
              </span>
              <h3 className="mt-2 font-display text-3xl font-medium text-ivory">
                {category.name}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-ivory/65">
                {category.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
