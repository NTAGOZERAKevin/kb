import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { BrandMark } from '../layout/Logo.jsx';
import { SignInCard } from './SignInCard.jsx';

export function AdminSignInOverlay({ redirectTo }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        navigate('/', { replace: true });
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-forest-dark px-4 py-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_18%_0%,#5a1858_0%,#3c0b3d_48%,#220421_100%)]" />
        <div className="absolute -left-32 top-[-10%] size-[30rem] rounded-full bg-clay/25 blur-3xl animate-aurora" />
        <div className="absolute -right-24 bottom-[-15%] size-[32rem] rounded-full bg-gold/15 blur-3xl animate-aurora [animation-duration:26s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:26px_26px]" />

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:block">
          <div className="relative grid size-[34rem] place-items-center opacity-[0.14]">
            <span className="absolute inset-0 rounded-full border border-gold/40 animate-spin-slow" />
            <span className="absolute inset-16 rounded-full border border-gold/30 animate-spin-slow [animation-duration:40s] [animation-direction:reverse]" />
            <BrandMark className="h-[18rem] w-auto animate-float-slow" />
          </div>
        </div>

        <Sparkles className="absolute left-[12%] top-[18%] size-5 text-gold/40 animate-float" />
        <Sparkles className="absolute right-[14%] top-[26%] size-4 text-gold/30 animate-float-slow" />
        <Sparkles className="absolute bottom-[16%] left-[18%] size-3.5 text-gold/30 animate-float-slow" />
      </div>

      <div className="relative z-10 flex w-full justify-center py-2">
        <SignInCard
          idPrefix="admin-login"
          redirectTo={redirectTo}
          onClose={() => navigate('/', { replace: true })}
          closeLabel="Close sign in and return to the shop"
          heading="Welcome Back!"
          subheading="Sign in with an owner or admin account to open the dashboard."
          allowSignUp={false}
          autoFocus
          footer={
            <>
              Not part of the team?{' '}
              <Link to="/" className="font-bold text-clay underline-offset-4 hover:underline">
                Back to the shop
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
