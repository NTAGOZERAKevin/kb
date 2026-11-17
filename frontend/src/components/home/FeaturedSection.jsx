import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { featuredProducts } from '../../data/homeContent.js';
import { useCart } from '../../context/cart-context.js';
import { productService } from '../../services/store.service.js';
import { ProductCard } from '../product/ProductCard.jsx';
import { Reveal } from '../ui/Reveal.jsx';

export function FeaturedSection() {
  const { addItem } = useCart();
  const [products, setProducts] = useState(featuredProducts);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedName, setAddedName] = useState('');

  useEffect(() => {
    let isActive = true;

    productService
      .list({ featured: 'true', limit: 8 })
      .then((data) => {
        if (isActive && data.items.length > 0) {
          setProducts(data.items);
        }
      })
      .catch(() => {
        // Keep the curated fallback if the API is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!addedName) {
      return undefined;
    }

    const timer = setTimeout(() => setAddedName(''), 2200);
    return () => clearTimeout(timer);
  }, [addedName]);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products],
  );

  const visibleProducts = useMemo(
    () =>
      activeCategory === 'All'
        ? products
        : products.filter((product) => product.category === activeCategory),
    [products, activeCategory],
  );

  function handleAdd(product) {
    addItem(product, 1);
    setAddedName(product.name);
  }

  return (
    <section id="collection" className="relative scroll-mt-28 overflow-hidden bg-sand/60 py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
              <Sparkles className="size-3.5" aria-hidden="true" />
              The collection
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
              Bottled nourishment.
            </h2>
          </Reveal>
          <Reveal delay={100} className="max-w-sm">
            <p className="text-sm leading-7 text-ink/55">
              Each blend is created with a clear purpose and a short list of ingredients
              your skin can recognise.
            </p>
            <Link
              to="/shop"
              className="group mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest transition hover:text-clay"
            >
              View all products
              <ArrowRight
                className="size-3.5 transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={140} className="mt-8 flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            const count =
              category === 'All'
                ? products.length
                : products.filter((product) => product.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] transition duration-300 ${
                  isActive
                    ? 'bg-forest text-ivory shadow-[0_14px_30px_-16px_rgba(34,4,33,0.95)]'
                    : 'border border-forest/15 bg-card text-forest/60 hover:-translate-y-0.5 hover:border-forest/35 hover:text-forest'
                }`}
              >
                {category}
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1 py-0.5 text-[9px] ${
                    isActive ? 'bg-ivory/15 text-ivory' : 'bg-forest/5 text-forest/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Reveal>

        <div
          key={activeCategory}
          className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              index={index}
              onAdd={product.stock > 0 ? handleAdd : undefined}
            />
          ))}
        </div>

        <div
          aria-live="polite"
          className={`pointer-events-none fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw_-_2rem)] -translate-x-1/2 transition-all duration-300 ${
            addedName ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <span className="flex max-w-full items-center gap-2 rounded-full bg-forest px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ivory shadow-soft">
            <Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="min-w-0 truncate">{addedName ? `${addedName} added` : ''}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
