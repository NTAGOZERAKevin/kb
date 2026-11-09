import { createContext, useContext } from 'react';

export const CartContext = createContext(undefined);

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }

  return context;
}
