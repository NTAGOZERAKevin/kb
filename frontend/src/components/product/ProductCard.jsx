import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export function ProductCard({ product, onAdd, index = 0 }) {
  const slug = product.slug || product.id;

  return (
    <article
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
        <Link to={`/shop/${slug}`} className="block size-full" aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-dark/25 via-transparent to-transparent" />
        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-forest backdrop-blur-sm">
            {product.tag}
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-surface/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-forest backdrop-blur-sm">
            {product.category}
          </span>
          {product.rating > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-forest-dark/90 px-2.5 py-1.5 text-[10px] font-bold text-ivory backdrop-blur-sm">
              <Star className="size-3 fill-gold text-gold" aria-hidden="true" />
              {product.rating}
            </span>
          )}
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={product.stock <= 0}
            className="absolute inset-x-4 top-4 flex translate-y-[-140%] items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory opacity-0 shadow-soft transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-ink/50"
          >
            <ShoppingBag className="size-3.5" aria-hidden="true" />
            {product.stock > 0 ? 'Add to cart' : 'Sold out'}
          </button>
        )}
      </div>

      <div className="px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold leading-tight text-forest">
            <Link to={`/shop/${slug}`} className="transition hover:text-forest-light">
              {product.name}
            </Link>
          </h3>
          <div className="whitespace-nowrap pt-1 text-right">
            <p className="text-sm font-bold text-forest">{formatCurrency(product.price)}</p>
            {product.compareAtPrice > product.price && (
              <p className="text-[11px] text-ink/35 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/55">{product.description}</p>
        {typeof product.stock === 'number' && (
          <p
            className={`mt-3 text-[10px] font-bold uppercase tracking-[0.14em] ${
              product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        )}
      </div>
    </article>
  );
}
