import { Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export function ProductCard({ product }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/20 via-transparent to-transparent" />
        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-forest backdrop-blur-sm">
            {product.tag}
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
          <span className="rounded-full bg-ivory/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-forest backdrop-blur-sm">
            {product.category}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-forest/90 px-2.5 py-1.5 text-[10px] font-bold text-ivory backdrop-blur-sm">
            <Star className="size-3 fill-gold text-gold" aria-hidden="true" />
            {product.rating}
          </span>
        </div>
      </div>

      <div className="px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold leading-tight text-forest">
            {product.name}
          </h3>
          <p className="whitespace-nowrap pt-1 text-sm font-bold text-forest">
            {formatCurrency(product.price)}
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/55">{product.description}</p>
      </div>
    </article>
  );
}
