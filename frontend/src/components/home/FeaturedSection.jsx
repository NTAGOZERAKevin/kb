import { useEffect, useState } from 'react';
import { featuredProducts } from '../../data/homeContent.js';
import { useCart } from '../../context/cart-context.js';
import { productService } from '../../services/store.service.js';
import { ProductCard } from '../product/ProductCard.jsx';
import { Reveal } from '../ui/Reveal.jsx';

export function FeaturedSection() {
  const { addItem } = useCart();
  const [products, setProducts] = useState(featuredProducts);

  useEffect(() => {
    let isActive = true;

    productService
      .list({ featured: 'true', limit: 4 })
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

  return (
    <section id="collection" className="scroll-mt-28 bg-sand/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
              The collection
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
              Bottled nourishment.
            </h2>
          </Reveal>
          <Reveal delay={100} as="p" className="max-w-sm text-sm leading-7 text-ink/55">
            Each blend is created with a clear purpose and a short list of ingredients
            your skin can recognise.
          </Reveal>
        </div>

        <div className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              index={index}
              onAdd={product._id ? (item) => addItem(item, 1) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
