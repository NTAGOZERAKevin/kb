import { featuredProducts } from '../../data/homeContent.js';
import { ProductCard } from '../product/ProductCard.jsx';

export function FeaturedSection() {
  return (
    <section id="collection" className="scroll-mt-28 bg-sand/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
              The collection
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
              Bottled nourishment.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-ink/55">
            Each blend is created with a clear purpose and a short list of ingredients
            your skin can recognise.
          </p>
        </div>

        <div className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
