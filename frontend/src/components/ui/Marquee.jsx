export function Marquee({ items, duration = 34, className = '' }) {
  return (
    <div
      className={`marquee-track relative flex overflow-hidden ${className}`}
      style={{ '--marquee-duration': `${duration}s` }}
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-10 pr-10"
          >
            {items.map((item, index) => (
              <span
                key={`${copy}-${index}`}
                className="flex items-center gap-10 whitespace-nowrap"
              >
                {typeof item === 'string' ? (
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em]">
                    {item}
                  </span>
                ) : (
                  item
                )}
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-current opacity-30"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
