import { ArrowDownRight, ArrowRight, Leaf, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber.jsx';
import { Button } from '../ui/Button.jsx';
import { Marquee } from '../ui/Marquee.jsx';
import { useTilt } from '../../hooks/useTilt.js';
import { siteConfig } from '../../config/site.js';
import { SocialIcon } from '../ui/SocialIcon.jsx';

const headline = [
  { text: 'Your', delay: 40 },
  { text: 'skin', delay: 110 },
  { text: 'knows', delay: 180 },
  { text: 'how', delay: 250 },
  { text: 'to', delay: 320 },
];

const promises = [
  { icon: Leaf, label: 'Plant-powered' },
  { icon: Sparkles, label: 'Small-batch' },
  { icon: ShieldCheck, label: 'Dermatologist tested' },
];

const stats = [
  { value: 2400, suffix: '+', label: 'Rituals delivered' },
  { value: 4.9, decimals: 1, suffix: '/5', label: 'Average rating' },
  { value: 100, suffix: '%', label: 'Botanical oils' },
];

const ticker = [
  'Cold-pressed botanicals',
  'Made in small batches',
  'Free delivery over RWF 50,000',
  'Cruelty-free, always',
  'Handwritten notes in every order',
  'Crafted in Kigali, Rwanda',
];

export function Hero() {
  const tiltProps = useTilt({ max: 6, scale: 1.02 });

  return (
    <section className="relative isolate overflow-hidden bg-forest text-ivory">
      <div className="pointer-events-none absolute -left-40 -top-24 size-[34rem] rounded-full bg-gold/20 blur-[110px] animate-aurora" />
      <div className="pointer-events-none absolute -right-32 top-10 size-[30rem] rounded-full bg-clay/25 blur-[110px] animate-aurora [animation-delay:-6s]" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-1/3 size-[26rem] rounded-full bg-moss/35 blur-[100px] animate-aurora [animation-delay:-12s]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#fdf8f6_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-8 lg:pb-24 lg:pt-16">
        <div>
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
            <span className="relative grid size-2 place-items-center">
              <span className="absolute size-2 rounded-full bg-gold animate-pulse-dot" />
            </span>
            Rooted in nature · Kigali, Rwanda
          </p>

          <h1 className="mt-7 max-w-2xl font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.01em] sm:text-[3.25rem] lg:text-[4rem]">
            <span className="flex flex-wrap items-baseline gap-x-[0.28em] gap-y-1">
              {headline.map((word) => (
                <span
                  key={word.text}
                  className="word-in"
                  style={{ animationDelay: `${word.delay}ms` }}
                >
                  {word.text}
                </span>
              ))}
              <span className="word-in italic text-gold" style={{ animationDelay: '390ms' }}>
                glow.
              </span>
            </span>
            <span
              className="mt-2 block word-in font-display text-[0.42em] font-normal italic leading-tight text-gold"
              style={{ animationDelay: '470ms' }}
            >
              Your beauty, our priority.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-ivory/65 sm:text-lg">
            Thoughtfully blended botanical oils for skin, hair, and body, made in small
            batches to bring out your healthiest natural radiance.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="#collection" variant="gold" size="lg" className="shine-hover">
              Shop the collection
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Button>
            <Button href="#ritual-finder" variant="light" size="lg">
              Find your ritual
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              {siteConfig.socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${siteConfig.name} on ${social.label}`}
                  className="block rounded-[28%] shadow-soft transition duration-300 hover:-translate-y-1 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <SocialIcon name={social.key} className="size-11" />
                </a>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" aria-hidden="true" />
                ))}
                <span className="ml-2 text-xs font-semibold text-ivory/80">4.9 / 5</span>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/45">
                See every product on our socials
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ivory/10 pt-6">
            {promises.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-ivory/50 transition hover:text-ivory"
              >
                <Icon className="size-3.5 text-gold" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div
            {...tiltProps}
            className="relative transition-transform duration-300 ease-out will-change-transform"
          >
            <div className="absolute -inset-3 rounded-t-[15rem] rounded-b-[2.5rem] border border-gold/20" />
            <div className="absolute -inset-8 rounded-t-[16rem] rounded-b-[3rem] border border-ivory/5" />
            <div className="relative overflow-hidden rounded-t-[14rem] rounded-b-[2rem] bg-sand shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)]">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=85"
                alt="Woman enjoying a calm, natural skincare ritual"
                className="aspect-[4/5] size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/55 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <p className="max-w-40 font-display text-xl italic leading-snug text-ivory">
                  &ldquo;A little ritual, every day.&rdquo;
                </p>
                <div className="grid size-16 shrink-0 place-items-center rounded-full border border-ivory/25 bg-forest/30 text-center backdrop-blur-md">
                  <span className="text-[8px] font-bold uppercase leading-tight tracking-[0.14em] text-ivory/80">
                    100%
                    <br />
                    botanical
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -left-8 bottom-24 hidden animate-float rounded-2xl border border-white/40 bg-surface/95 p-4 text-forest shadow-soft backdrop-blur sm:block">
              <p className="font-display text-2xl font-semibold leading-none">98%</p>
              <p className="mt-1 max-w-28 text-[9px] font-bold uppercase leading-relaxed tracking-[0.12em] text-ink/45">
                saw softer skin in 4 weeks
              </p>
            </div>

            <div className="absolute -right-6 top-16 hidden animate-float-slow rounded-2xl border border-white/40 bg-surface/95 px-4 py-3 text-forest shadow-soft backdrop-blur sm:block">
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em]">
                Loved by our community
              </p>
            </div>

            <div className="absolute -left-6 top-6 grid size-24 place-items-center rounded-full border border-gold/25 bg-forest-dark/60 backdrop-blur-md sm:-left-10">
              <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow">
                <defs>
                  <path
                    id="hero-badge-circle"
                    d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
                  />
                </defs>
                <text className="fill-gold text-[9px] font-bold uppercase">
                  <textPath href="#hero-badge-circle" startOffset="0">
                    Small batch · Botanical · Rwanda ·
                  </textPath>
                </text>
              </svg>
              <Sparkles className="size-5 text-gold" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-y border-ivory/10 bg-forest-dark/60 py-4 text-gold/85 backdrop-blur">
        <Marquee items={ticker} duration={38} />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 divide-y divide-ivory/10 px-4 py-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 py-4 text-center first:pl-0 last:pr-0 sm:px-6 sm:py-0">
            <p className="font-display text-2xl font-semibold text-ivory sm:text-4xl">
              <AnimatedNumber
                value={stat.value}
                format={(number) =>
                  stat.decimals
                    ? number.toFixed(stat.decimals)
                    : Math.round(number).toLocaleString()
                }
              />
              <span className="text-gold">{stat.suffix}</span>
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory/40 sm:text-[10px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
