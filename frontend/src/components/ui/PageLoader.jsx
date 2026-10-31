import { LoaderCircle } from 'lucide-react';

export function PageLoader({ label = 'Loading your experience' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory" role="status">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-7 animate-spin text-forest" aria-hidden="true" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-forest/45">
          {label}
        </p>
      </div>
    </div>
  );
}
