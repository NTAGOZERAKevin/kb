import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './cart-context.js';

const STORAGE_KEY = 'beauty-oil-market:cart';

function readStoredCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    const productId = product._id || product.id;
    if (!productId) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.product === productId);
      const stock = Number.isFinite(product.stock) ? product.stock : 99;

      if (existing) {
        return current.map((item) =>
          item.product === productId
            ? {
                ...item,
                quantity: Math.min(stock || 99, item.quantity + quantity),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product: productId,
          slug: product.slug || product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          stock,
          quantity: Math.min(stock || 99, Math.max(1, quantity)),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.product !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product === productId
            ? { ...item, quantity: Math.max(1, Math.min(item.stock || 99, quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
