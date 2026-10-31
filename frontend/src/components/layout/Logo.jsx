import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site.js';

export function Logo({ light = false, className = '', onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${siteConfig.name} home`}
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span
        className={`grid size-10 place-items-center rounded-full border transition-transform duration-500 group-hover:rotate-6 ${
          light
            ? 'border-ivory/25 bg-ivory/10 text-gold'
            : 'border-forest/15 bg-forest text-gold'
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M12 3c3.1 4.5 5.7 8.1 5.7 11.4A5.7 5.7 0 0 1 12 20.1a5.7 5.7 0 0 1-5.7-5.7C6.3 11.1 8.9 7.5 12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 9.4c1.7 2.5 3 4.4 3 6.2a3 3 0 0 1-6 0c0-1.8 1.3-3.7 3-6.2Z"
            fill="currentColor"
            opacity=".55"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-2xl font-semibold tracking-tight ${
            light ? 'text-ivory' : 'text-forest'
          }`}
        >
          Beauty Oil
        </span>
        <span
          className={`mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.38em] ${
            light ? 'text-ivory/60' : 'text-forest/55'
          }`}
        >
          Market
        </span>
      </span>
    </Link>
  );
}
