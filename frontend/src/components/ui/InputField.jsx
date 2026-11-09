import { useId } from 'react';

export function InputField({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = '',
  id,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest/40"
            aria-hidden="true"
          />
        )}
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? descriptionId : undefined}
          className={`w-full rounded-2xl border bg-card px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15 ${
            Icon ? 'pl-11' : ''
          } ${rightElement ? 'pr-12' : ''} ${
            error ? 'border-red-300' : 'border-forest/15'
          }`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {(error || hint) && (
        <p
          id={descriptionId}
          className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-ink/50'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
