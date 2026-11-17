import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { Reveal } from '../ui/Reveal.jsx';

const faqs = [
  {
    question: 'How quickly do the oils absorb?',
    answer:
      'Our face and body oils are blended with lightweight botanical carriers such as jojoba and sweet almond, so most formulas sink in within one to two minutes. Warm two or three drops between your palms and press gently into damp skin for the softest finish.',
  },
  {
    question: 'Are the oils suitable for sensitive skin?',
    answer:
      'Every blend is fragrance-light, cruelty-free and dermatologist tested. If your skin is reactive, start with a patch test on your inner arm and use the oil every other evening for the first week before building up to daily use.',
  },
  {
    question: 'How do I build a routine with three oils?',
    answer:
      'A simple ritual works best: face oil after cleansing at night, scalp oil once a week before washing, and body oil while your skin is still slightly damp after a shower. Our ritual finder can suggest where to start.',
  },
  {
    question: 'Do you deliver outside Rwanda?',
    answer:
      'We currently deliver across Rwanda, with free delivery on orders over RWF 50,000. Regional and international shipping is available on request — write to us and we will arrange a courier quote for your address.',
  },
  {
    question: 'How are the oils made?',
    answer:
      'Each batch is cold-pressed, blended by hand in small quantities and rested before bottling. That means fresher oils, a shorter ingredient list, and no filler. Because batches are small, packaging may vary slightly from one order to the next.',
  },
  {
    question: 'What if a product does not suit me?',
    answer:
      'Reach out within 14 days of delivery and we will help you find a better match or arrange a return for unopened bottles. Your ritual should feel right, so we keep the process simple and personal.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-28 bg-sand/50 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-clay">
            Good to know
          </p>
          <h2 className="mt-4 max-w-sm font-display text-4xl font-medium leading-[1.05] text-forest sm:text-5xl">
            Questions, answered with care.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-ink/55">
            Everything about textures, routines, and delivery. If something is still
            unclear, a real person is one message away.
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(34,4,33,0.6)]">
            <p className="font-display text-2xl text-forest">Still curious?</p>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Tell us about your skin and we will reply within one working day.
            </p>
            <Link
              to="/#contact"
              className="group mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-forest transition hover:text-clay"
            >
              Talk to our team
              <ArrowUpRight
                className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120} className="divide-y divide-forest/10 border-y border-forest/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={faq.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="group flex w-full items-center justify-between gap-5 py-5 text-left transition"
                  >
                    <span
                      className={`font-display text-xl font-semibold transition-colors sm:text-2xl ${
                        isOpen ? 'text-forest' : 'text-forest/75 group-hover:text-forest'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full border transition duration-300 ${
                        isOpen
                          ? 'rotate-180 border-forest bg-forest text-ivory'
                          : 'border-forest/20 text-forest group-hover:border-forest/50'
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Plus className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 pr-12 text-sm leading-7 text-ink/60">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
