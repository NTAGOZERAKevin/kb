import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { useCart } from '../context/cart-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { productService } from '../services/store.service.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  useDocumentTitle('Shop');

  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput === query) {
        return;
      }
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        next.set('q', searchInput.trim());
      } else {
        next.delete('q');
      }
      next.delete('page');
      setSearchParams(next, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, query, searchParams, setSearchParams]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    productService
      .list({ q: query, category, sort, page, limit: 12 })
      .then((data) => {
        if (!isActive) {
          return;
        }
        setProducts(data.items);
        setCategories(data.categories);
        setPagination(data.pagination);
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load the collection.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query, category, sort, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  }

  function handleAdd(product) {
    addItem(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1600);
  }

  return (
    <section className="bg-sand/40 pb-20">
      <div className="relative overflow-hidden bg-forest text-ivory">
        <div className="pointer-events-none absolute -right-20 -top-24 size-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-moss/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
              The collection
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-[0.98] sm:text-6xl">
              Find your <span className="italic text-gold">ritual.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/60 sm:text-base">
              Small-batch botanical oils for face, hair, and body. Filter by ritual,
              search by ingredient, and add your favourites to the cart.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-8 rounded-[2rem] border border-forest/10 bg-surface p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest/40"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search oils, ingredients, categories..."
                className="w-full rounded-full border border-forest/15 bg-card py-3.5 pl-11 pr-10 text-sm outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-forest/40 transition hover:bg-forest/5 hover:text-forest"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 shrink-0 text-forest/40" aria-hidden="true" />
              <select
                value={sort}
                onChange={(event) => updateParam('sort', event.target.value)}
                className="w-full rounded-full border border-forest/15 bg-card px-4 py-3 text-xs font-semibold text-forest outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 sm:w-auto"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['all', ...categories].map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateParam('category', item)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                    active
                      ? 'bg-forest text-ivory shadow-[0_10px_24px_-14px_rgba(23,59,50,0.9)]'
                      : 'border border-forest/15 bg-card text-forest/60 hover:border-forest/35 hover:text-forest'
                  }`}
                >
                  {item === 'all' ? 'All products' : item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
            {isLoading ? 'Loading...' : `${pagination.total} products`}
          </p>
          {addedId && (
            <p className="animate-fade-up rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              Added to cart
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="skeleton aspect-[4/5] rounded-[2rem]" />
                <div className="skeleton mt-5 h-5 w-3/4 rounded-full" />
                <div className="skeleton mt-3 h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-[2rem] border border-dashed border-forest/20 bg-surface px-6 py-20 text-center">
            <PackageSearch className="size-10 text-forest/30" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-medium text-forest">
              No oils matched your search.
            </h2>
            <p className="mt-2 max-w-sm text-sm text-ink/50">
              Try a different category or clear your search to see the full collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchParams({});
              }}
              className="mt-6 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-forest-light"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} onAdd={handleAdd} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => updateParam('page', pagination.page - 1)}
              className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => updateParam('page', pagination.page + 1)}
              className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest transition hover:border-forest disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
