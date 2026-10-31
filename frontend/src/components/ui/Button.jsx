import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary:
    'bg-forest text-ivory shadow-[0_12px_30px_-16px_rgba(23,59,50,0.9)] hover:-translate-y-0.5 hover:bg-forest-light',
  gold: 'bg-gold text-forest-dark shadow-[0_12px_30px_-16px_rgba(199,164,107,0.9)] hover:-translate-y-0.5 hover:bg-gold-light',
  outline:
    'border border-forest/25 bg-transparent text-forest hover:border-forest hover:bg-forest hover:text-ivory',
  light:
    'border border-ivory/30 bg-ivory/10 text-ivory backdrop-blur-sm hover:border-ivory/60 hover:bg-ivory/20',
  ghost: 'text-forest hover:bg-forest/5',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

export function Button({
  children,
  to,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
