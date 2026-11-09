import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { useAuth } from '../context/auth-context.js';
import { useCart } from '../context/cart-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { productService } from '../services/store.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function Stars({ rating = 0, className = 'size-3.5' }) {
  return (
    <span className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${className} ${index < Math.round(rating) ? 'fill-current' : 'opacity-25'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    productService
      .get(slug)
      .then(async (foundProduct) => {
        if (!isActive) {
          return;
        }
        setProduct(foundProduct);
        const productReviews = await productService.reviews(foundProduct._id);
        if (isActive) {
          setReviews(productReviews);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load this product.'));
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
  }, [slug]);

  useDocumentTitle(product?.name || 'Product');

  function handleAdd(goToCheckout = false) {
    if (!product) {
      return;
    }
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (goToCheckout) {
      navigate('/checkout');
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setIsReviewSubmitting(true);
    setReviewError('');
    setReviewNotice('');

    try {
      const result = await productService.addReview(product._id, reviewForm);
      setProduct(result.product);
      const productReviews = await productService.reviews(product._id);
      setReviews(productReviews);
      setReviewForm({ rating: 5, comment: '' });
      setReviewNotice('Thank you for sharing your ritual.');
    } catch (requestError) {
      setReviewError(getErrorMessage(requestError, 'We could not save your review.'));
    } finally {
      setIsReviewSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="skeleton aspect-[4/5] rounded-[2.5rem]" />
          <div className="space-y-5">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-12 w-3/4 rounded-2xl" />
            <div className="skeleton h-5 w-1/3 rounded-full" />
            <div className="skeleton h-32 w-full rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Alert>{error || 'Product not found'}</Alert>
        <Button to="/shop" variant="outline" className="mt-6">
          Back to the collection
        </Button>
      </section>
    );
  }

  const inStock = product.stock > 0;

  return (
    <section className="bg-sand/35 pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-forest/50 transition hover:text-forest"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to shop
        </Link>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-[2.5rem] bg-sand">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] size-full object-cover"
            />
          </div>
          {product.tag && (
            <span className="absolute left-5 top-5 rounded-full bg-surface/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-forest backdrop-blur">
              {product.tag}
            </span>
          )}
          <div className="absolute -bottom-4 right-6 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest shadow-soft">
            <ShieldCheck className="size-3.5 text-clay" aria-hidden="true" />
            100% botanical
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
            {product.category}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-xs font-semibold text-ink/45">
              {product.rating > 0 ? product.rating.toFixed(1) : 'New'} ·{' '}
              {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {inStock ? `${product.stock} in stock` : 'Sold out'}
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-4xl font-semibold text-forest">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice > product.price && (
              <p className="pb-1 text-sm text-ink/35 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>

          <p className="mt-6 text-base leading-8 text-ink/60">{product.description}</p>

          {product.benefits?.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-forest/80">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between rounded-full border border-forest/15 bg-card px-2 py-1.5 sm:w-36">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-9 place-items-center rounded-full text-forest transition hover:bg-forest/5"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-sm font-bold text-forest">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
                className="grid size-9 place-items-center rounded-full text-forest transition hover:bg-forest/5"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={!inStock}
              onClick={() => handleAdd(false)}
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              {added ? 'Added to cart' : 'Add to cart'}
            </Button>
            <Button
              type="button"
              variant="gold"
              size="lg"
              disabled={!inStock}
              onClick={() => handleAdd(true)}
            >
              Buy now
            </Button>
          </div>

          <div className="mt-8 grid gap-3 border-t border-forest/10 pt-6 text-xs text-ink/50 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Truck className="size-4 text-clay" aria-hidden="true" />
              Free delivery over {formatCurrency(50000)}
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-clay" aria-hidden="true" />
              Secure checkout, encrypted account
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="rounded-[2.5rem] border border-forest/10 bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">
                Community notes
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-forest">
                Reviews ({reviews.length})
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-2xl bg-sand/60 p-6 text-sm text-ink/50">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}
              {reviews.map((review) => (
                <article key={review._id} className="rounded-2xl border border-forest/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-forest">{review.user?.name || 'Customer'}</p>
                    <Stars rating={review.rating} className="size-3" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{review.comment}</p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl bg-sand/50 p-6">
              <h3 className="font-display text-2xl font-medium text-forest">Share your ritual</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  {reviewError && <Alert>{reviewError}</Alert>}
                  {reviewNotice && <Alert type="success">{reviewNotice}</Alert>}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest/60">
                      Rating
                    </span>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                          className="text-gold transition hover:scale-110"
                          aria-label={`${value} star${value === 1 ? '' : 's'}`}
                        >
                          <Star
                            className={`size-6 ${
                              value <= reviewForm.rating ? 'fill-current' : 'opacity-25'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, comment: event.target.value }))
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="What did this oil do for your routine?"
                    className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isReviewSubmitting}>
                    {isReviewSubmitting ? 'Saving...' : 'Submit review'}
                  </Button>
                </form>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-6 text-ink/55">
                    Sign in to leave a review and save your favourite oils.
                  </p>
                  <Button to="/login" className="mt-4 w-full">
                    Sign in to review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
