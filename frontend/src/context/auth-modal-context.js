import { createContext, useContext } from 'react';

export const AuthModalContext = createContext(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error('useAuthModal must be used inside an AuthModalProvider');
  }

  return context;
}
