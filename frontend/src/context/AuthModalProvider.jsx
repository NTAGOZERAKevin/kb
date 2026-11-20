import { useCallback, useMemo, useState } from 'react';
import { AuthModal } from '../components/auth/AuthModal.jsx';
import { AuthModalContext } from './auth-modal-context.js';

export function AuthModalProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, redirectTo: null, mode: 'signin' });

  const openLogin = useCallback((redirectTo = null) => {
    setState({ isOpen: true, redirectTo, mode: 'signin' });
  }, []);

  const openSignup = useCallback((redirectTo = null) => {
    setState({ isOpen: true, redirectTo, mode: 'signup' });
  }, []);

  const closeLogin = useCallback(() => {
    setState({ isOpen: false, redirectTo: null, mode: 'signin' });
  }, []);

  const value = useMemo(
    () => ({ openLogin, openSignup, closeLogin }),
    [openLogin, openSignup, closeLogin],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={state.isOpen}
        redirectTo={state.redirectTo}
        initialMode={state.mode}
        onClose={closeLogin}
      />
    </AuthModalContext.Provider>
  );
}
