import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Moon,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
} from 'lucide-react';
import { featuredProducts } from '../../data/homeContent.js';
import { useCart } from '../../context/cart-context.js';
import { productService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Reveal } from '../ui/Reveal.jsx';

const steps = [
  {
    key: 'need',
    eyebrow: 'Step one',
    question: 'What does your skin need most?',
    hint: 'Choose the ritual you are drawn to right now.',
    options: [
      { value: 'Face Care', label: 'A calm, balanced glow', detail: 'Face care' },
      { value: 'Hair Care', label: 'Stronger, healthier hair', detail: 'Hair care' },
      { value: 'Body Care', label: 'Deep, lasting moisture', detail: 'Body care' },
      { value: 'Gift Sets', label: 'A gift for someone', detail: 'Gift sets' },
    ],
  },
  {
    key: 'moment',
    eyebrow: 'Step two',
    question: 'When does your ritual happen?',
    hint: 'We match the blend to the pace of your day.',
    options: [
      { value: 0, label: 'First light', detail: 'Morning ritual', icon: Sunrise },
      { value: 1, label: 'Golden hour', detail: 'Evening wind-down', icon: Sun },
      { value: 2, label: 'Once a week', detail: 'Slow Sunday', icon: Moon },
    ],
  },
  {
    key: 'finish',
    eyebrow: 'Step three',
    question: 'How should it feel on skin?',
    hint: 'Texture matters as much as the scent.',
    options: [
      { value: 0, label: 'Light and dewy', detail: 'Absorbs in seconds' },
      { value: 1, label: 'Rich and cushioned', detail: 'A little goes far' },
      { value: 2, label: 'Soft and silky', detail: 'Weightless finish' },
    ],
  },
];

export function RitualFinder() {
  const { addItem } = useCart();
  const [products, setProducts] = useState(featuredProducts);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let isActive = true;

    productService
      .list({ limit: 24 })
      .then((data) => {
        if (isActive && data.items.length > 0) {
          setProducts(data.items);
        }
      })
      .catch(() => {
        // The curated fallback still lets the finder work offline.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const isComplete = stepIndex >= steps.length;
  const step = steps[stepIndex];

  const recommendation = useMemo(() => {
    if (!isComplete) {
      return null;
    }

    const pool = products.filter((product) => product.category === answers.need);
    const source = pool.length > 0 ? pool : products;
    const offset = ((answers.moment || 0) + (answers.finish || 0)) % source.length;
    return source[offset] || null;
  }, [isComplete, products, answers]);

  function selectOption(value) {
    setAnswers((current) => ({ ...current, [step.key]: value }));
    setStepIndex((current) => current + 1);
  }

  function restart() {
    setAnswers({});
    setStepIndex(0);
    setIsAdded(false);
  }

  return (
    <section
      id="ritual-finder"
      className="relative scroll-mt-28 overflow-hidden bg-forest py-20 text-ivory lg:py-28"
    >
      <div className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-gold/15 blur-[100px] animate-aurora" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-moss/30 blur-[100px] animate-aurora [animation-delay:-8s]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#fdf8f6_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Ritual finder
            </p>
            <h2 className="mt-6 font-display text-4xl font-medium leading-tight sm:text-5xl">
              Three questions. One perfect bottle.
            </h2>
            <p className="mt-4 text-sm leading-7 text-ivory/55">
              Answer a few quick questions and we will match you with the blend your skin
              is asking for.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="rounded-[2rem] border border-ivory/10 bg-ivory/[0.04] p-6 backdrop-blur-sm sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {isComplete ? 'Yours to keep' : step.eyebrow}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/35">
                {Math.min(stepIndex + 1, steps.length)} / {steps.length}
              </p>
            </div>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-ivory/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-clay transition-all duration-700 ease-out"
                style={{ width: `${(stepIndex / steps.length) * 100}%` }}
              />
            </div>

            {isComplete ? (
              <div key="result" className="animate-fade-up">
                <h3 className="mt-8 font-display text-3xl font-medium leading-tight sm:text-4xl">
                  {recommendation ? (
                    <>
                      Meet your new ritual:
                      <span className="block italic text-gold">{recommendation.name}</span>
                    </>
                  ) : (
                    'Your ritual is almost ready.'
                  )}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-ivory/60">
                  A {answers.need?.toLowerCase()} blend chosen for the way you like to
                  unwind. Use it consistently for a few weeks and let your skin do the
                  talking.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/80 transition hover:border-gold hover:text-gold"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Start again
                  </button>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition hover:text-gold-light"
                  >
                    Browse everything
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : (
              <div key={step.key} className="animate-fade-up">
                <h3 className="mt-8 font-display text-3xl font-medium leading-tight sm:text-4xl">
                  {step.question}
                </h3>
                <p className="mt-3 text-sm text-ivory/50">{step.hint}</p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {step.options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = answers[step.key] === option.value;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => selectOption(option.value)}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-gold bg-gold/15'
                            : 'border-ivory/15 bg-ivory/[0.03] hover:border-gold/60 hover:bg-ivory/[0.07]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {Icon ? (
                            <span className="grid size-9 place-items-center rounded-full bg-ivory/10 text-gold">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                          ) : null}
                          <span>
                            <span className="block text-sm font-semibold text-ivory">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/35">
                              {option.detail}
                            </span>
                          </span>
                        </span>
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${
                            isSelected
                              ? 'border-gold bg-gold text-forest-dark'
                              : 'border-ivory/25 text-transparent group-hover:border-gold/60'
                          }`}
                        >
                          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setStepIndex((current) => current - 1)}
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/45 transition hover:text-ivory"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Previous question
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-ivory/10 bg-forest-dark/60 p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/15 blur-2xl" />
            <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-ivory/40">
              Your match
            </p>

            {recommendation ? (
              <div key={recommendation._id || recommendation.id} className="animate-fade-up">
                <div className="relative mt-4 overflow-hidden rounded-[1.5rem]">
                  <img
                    src={recommendation.image}
                    alt={recommendation.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-forest backdrop-blur">
                    {recommendation.category}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">
                  {recommendation.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ivory/55">
                  {recommendation.description}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-gold">
                    {formatCurrency(recommendation.price)}
                  </p>
                  {recommendation._id ? (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(recommendation, 1);
                        setIsAdded(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-dark transition hover:bg-gold-light"
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-3.5" aria-hidden="true" />
                          Add to cart
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-dark"
                    >
                      View in shop
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex min-h-[16rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-ivory/15 px-6 text-center sm:min-h-[24rem]">
                <span className="grid size-16 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                  <Sparkles className="size-6 animate-float" aria-hidden="true" />
                </span>
                <p className="mt-5 font-display text-2xl italic text-ivory/70">
                  Your ritual appears here.
                </p>
                <p className="mt-2 max-w-56 text-xs leading-6 text-ivory/40">
                  Answer the three questions and we will reveal the bottle made for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
