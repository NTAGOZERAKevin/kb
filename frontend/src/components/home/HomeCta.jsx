import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function HomeCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-clay px-6 py-16 text-center sm:px-12 lg:py-20">
        <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full border border-ivory/15" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 size-80 rounded-full border border-ivory/15" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.26em] text-ivory/65">
          Your daily dose of glow
        </p>
        <h2 className="relative mx-auto mt-5 max-w-2xl font-display text-4xl font-medium leading-tight text-ivory sm:text-5xl lg:text-6xl">
          Make space for a little more softness.
        </h2>
        <p className="relative mx-auto mt-5 max-w-lg text-sm leading-7 text-ivory/70 sm:text-base">
          Create an account to save your favourite rituals, follow your orders, and make
          checkout effortless.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/register" variant="gold" size="lg">
            Create your account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button href="#collection" variant="light" size="lg">
            Browse the collection
          </Button>
        </div>
      </div>
    </section>
  );
}
