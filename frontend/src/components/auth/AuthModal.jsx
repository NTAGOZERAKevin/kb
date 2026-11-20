import { useEffect } from 'react';
import { SignInCard } from './SignInCard.jsx';

export function AuthModal({ isOpen, redirectTo, initialMode = 'signin', onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-forest-dark/70 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <SignInCard
          idPrefix="login-modal"
          redirectTo={redirectTo}
          onSuccess={onClose}
          onClose={onClose}
          closeLabel="Close sign in"
          autoFocus
          initialMode={initialMode}
        />
      </div>
    </div>
  );
}
