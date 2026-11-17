import { Link } from 'react-router-dom';

export function BrandMark({ className = '' }) {
  return (
    <img
      src="/brand/golden-crown-mark.png"
      alt=""
      role="img"
      aria-label="Sharon Glow Boutique crowned woman emblem"
      draggable="false"
      className={`select-none object-contain drop-shadow-[0_2px_8px_rgba(34,4,33,0.22)] ${className}`}
    />
  );
}

export function Logo({ light = false, className = '', onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Sharon Glow Boutique home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <BrandMark className="h-10 w-auto shrink-0 transition-transform duration-500 group-hover:scale-105 sm:h-14" />

      <span className="min-w-0 leading-none">
        <span
          className={`block truncate font-display text-[1.1rem] font-medium leading-none tracking-tight ${
            light ? 'text-ivory' : 'text-forest'
          }`}
        >
          Sharon Glow
        </span>
        <span className="mt-1 flex items-end gap-1.5">
          <span className="truncate font-display text-[1.25rem] font-semibold leading-[0.85] text-gold sm:text-[1.5rem]">
            Boutique
          </span>
          <span
            className={`mb-0.5 h-[2px] w-7 rounded-full bg-gradient-to-r from-gold to-transparent ${
              light ? 'opacity-80' : 'opacity-60'
            }`}
          />
        </span>
      </span>
    </Link>
  );
}
