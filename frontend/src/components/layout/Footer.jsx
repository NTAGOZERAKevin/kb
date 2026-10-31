import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '../../config/site.js';
import { Logo } from './Logo.jsx';

export function Footer() {
  return (
    <footer id="contact" className="bg-forest-dark text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-7 text-ivory/60">
              Small-batch botanical oils made to bring out your natural glow, without
              compromise.
            </p>
            <p className="mt-6 font-display text-2xl italic text-gold/90">
              Glow, the natural way.
            </p>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-ivory/40">
              Explore
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-ivory/70">
              <li>
                <a className="transition hover:text-gold" href="/#collection">
                  The collection
                </a>
              </li>
              <li>
                <a className="transition hover:text-gold" href="/#story">
                  Our story
                </a>
              </li>
              <li>
                <a className="transition hover:text-gold" href="/#reviews">
                  Customer reviews
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-ivory/40">
              Account
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-ivory/70">
              <li>
                <Link className="transition hover:text-gold" to="/login">
                  Sign in
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-gold" to="/register">
                  Create account
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-gold" to="/profile">
                  My profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-ivory/40">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-4 text-sm text-ivory/70">
              <li>
                <a
                  className="flex items-start gap-3 transition hover:text-gold"
                  href={`mailto:${siteConfig.email}`}
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                {siteConfig.location}
              </li>
            </ul>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold transition hover:text-gold-light"
            >
              Ask us anything
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/10 pt-7 text-xs text-ivory/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.18em]">Crafted with care in Rwanda</p>
        </div>
      </div>
    </footer>
  );
}
