import { ArrowUpRight, Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { siteConfig } from '../../config/site.js';
import { Reveal } from '../ui/Reveal.jsx';

const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  siteConfig.mapQuery,
)}&z=${siteConfig.mapZoom}&output=embed`;

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  siteConfig.mapQuery,
)}`;

export function VisitSection() {
  return (
    <section id="visit" className="relative scroll-mt-28 overflow-hidden bg-sand/60">
      <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-forest/10 bg-surface px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-forest/70">
              <MapPin className="size-3.5 text-clay" aria-hidden="true" />
              Visit the boutique
            </p>

            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
              Come and see us
              <span className="mt-1 block font-script text-3xl text-clay sm:text-4xl">
                in Kigali
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-ink/60">
              Smell the blends before you buy, get a personal recommendation, or pick up an order
              in person. Open the map and we will guide you right to the door.
            </p>

            <div className="mt-8 space-y-4 rounded-[1.5rem] border border-forest/10 bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15">
                  <MapPin className="size-4 text-clay" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest/50">
                    Our address
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-forest">
                    {siteConfig.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-forest/10 pt-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15">
                  <Phone className="size-4 text-clay" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest/50">
                    Call before you come
                  </p>
                  <a
                    className="mt-1 inline-block text-sm font-semibold text-forest transition hover:text-clay"
                    href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                  >
                    {siteConfig.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-forest/10 pt-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15">
                  <Clock className="size-4 text-clay" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest/50">
                    Delivery
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/60">
                    Can&apos;t make it? Choose your area at checkout and we deliver to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory transition hover:bg-forest-light"
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get directions
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-forest/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-forest transition hover:border-forest/30 hover:bg-surface"
                href={mapEmbedUrl.replace('&output=embed', '')}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-forest/10 bg-card shadow-soft">
              <iframe
                title={`Map showing ${siteConfig.name} in ${siteConfig.location}`}
                src={mapEmbedUrl}
                className="h-[340px] w-full border-0 sm:h-[420px] lg:h-[460px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-forest-dark/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory shadow-soft backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold-light" />
              {siteConfig.name}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
