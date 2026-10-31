import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isActive) {
          setUser(currentUser);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener('beauty-oil-market:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('beauty-oil-market:unauthorized', handleUnauthorized);
    };
  }, []);

  async function login(credentials) {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(payload) {
    const registeredUser = await authService.register(payload);
    setUser(registeredUser);
    return registeredUser;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
