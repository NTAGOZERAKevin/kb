import { Link } from 'react-router-dom';

const markSizes = {
  default: 'h-10 sm:h-14',
  nav: 'h-12 sm:h-16',
};

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

export function Logo({
  light = false,
  className = '',
  onClick,
  size = 'default',
  framed = false,
}) {
  const mark = (
    <BrandMark
      className={`${markSizes[size]} w-auto shrink-0 transition-transform duration-500 group-hover:scale-105`}
    />
  );

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Sharon Glow Boutique home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      {framed ? (
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-card/85 p-1 ring-1 ring-gold/30 shadow-[0_8px_24px_-14px_rgba(34,4,33,0.55)] sm:size-[4.5rem]">
          {mark}
        </span>
      ) : (
        mark
      )}

      <span className="min-w-0 leading-none">
        <span
          className={`block whitespace-nowrap font-display text-[1.1rem] font-medium leading-none tracking-tight ${
            light ? 'text-ivory' : 'text-forest'
          }`}
        >
          Sharon Glow
        </span>
        <span className="mt-1 flex items-end gap-1.5">
          <span className="whitespace-nowrap font-display text-[1.25rem] font-semibold leading-[0.85] text-gold sm:text-[1.5rem]">
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
