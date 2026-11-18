import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Clock3 } from 'lucide-react';

function ValueBlock({ option, align = 'left' }) {
  return (
    <span className={`shrink-0 ${align === 'right' ? 'text-right' : ''}`}>
      {option.originalPrice && (
        <span className="block text-[10px] font-medium text-ink/35 line-through">
          {option.originalPrice}
        </span>
      )}
      {option.price && <span className="block text-sm font-bold text-forest">{option.price}</span>}
      {option.meta && (
        <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-clay">
          <Clock3 className="size-3" aria-hidden="true" />
          {option.meta}
        </span>
      )}
    </span>
  );
}

export function SelectMenu({
  id,
  value,
  onChange,
  options,
  renderOption,
  ariaLabel,
  placeholder = 'Select an option',
  className = '',
  listClassName = 'max-h-72',
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const generatedId = useId();
  const listId = `${id ?? generatedId}-listbox`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const SelectedIcon = selected?.icon;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  function scrollOptionIntoView(index) {
    listRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  function focusOption(index) {
    if (!options.length) return;

    let next = Math.min(Math.max(index, 0), options.length - 1);
    for (let step = 0; step < options.length && options[next]?.disabled; step += 1) {
      next = (next + 1) % options.length;
    }

    setActiveIndex(next);
    scrollOptionIntoView(next);
  }

  useEffect(() => {
    if (open) focusOption(selectedIndex >= 0 ? selectedIndex : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function moveActive(direction) {
    if (!options.length) return;

    let next = activeIndex;
    for (let step = 0; step < options.length; step += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) break;
    }

    setActiveIndex(next);
    scrollOptionIntoView(next);
  }

  function close(focusTrigger = false) {
    setOpen(false);
    if (focusTrigger) buttonRef.current?.focus();
  }

  function choose(option) {
    if (!option || option.disabled) return;
    onChange(option.value);
    close(true);
  }

  function handleKeyDown(event) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') {
      close();
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
          open ? 'border-forest/40 ring-4 ring-gold/15' : 'border-forest/15 hover:border-forest/30'
        }`}
      >
        {selected ? (
          <>
            {SelectedIcon && (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sand text-forest">
                <SelectedIcon className="size-5" aria-hidden="true" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-forest">{selected.label}</span>
              {selected.description && (
                <span className="mt-0.5 block truncate text-xs text-ink/45">
                  {selected.description}
                </span>
              )}
            </span>
            <ValueBlock option={selected} align="right" />
          </>
        ) : (
          <span className="min-w-0 flex-1 text-sm font-medium text-ink/40">{placeholder}</span>
        )}

        <ChevronDown
          className={`size-4 shrink-0 text-forest/50 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute inset-x-0 z-40 mt-2 overflow-y-auto overscroll-contain rounded-2xl border border-forest/15 bg-surface p-1.5 shadow-[0_28px_60px_-20px_rgba(34,4,33,0.4)] ${listClassName}`}
        >
          {options.map((option, index) => {
            const OptionIcon = option.icon;
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                disabled={option.disabled}
                data-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                className={
                  renderOption
                    ? `w-full rounded-2xl text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        option.fullWidth ? 'col-span-full' : ''
                      }`
                    : `flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        isActive ? 'bg-sand/70' : ''
                      } ${isSelected ? 'ring-1 ring-inset ring-forest/20' : ''}`
                }
              >
                {renderOption ? (
                  renderOption(option, { isSelected, isActive })
                ) : (
                  <>
                    {OptionIcon && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand text-forest">
                        <OptionIcon className="size-4" aria-hidden="true" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-forest">
                        {option.label}
                        {isSelected && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                      </span>
                      {option.description && (
                        <span
                          className={`mt-0.5 block text-xs leading-5 ${
                            option.disabled ? 'text-clay' : 'text-ink/45'
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </span>

                    <ValueBlock option={option} align="right" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectMenu;
