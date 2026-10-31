import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page Not Found');

  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-sand/40 px-4 py-20 text-center">
      <div>
        <p className="font-display text-8xl font-medium text-gold">404</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-forest">
          This page has wandered off.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/55">
          The page you are looking for does not exist, but your next favourite ritual is
          still waiting on the home page.
        </p>
        <Button to="/" className="mt-8">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Button>
      </div>
    </section>
  );
}
