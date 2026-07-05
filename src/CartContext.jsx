import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem('styleher-cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    window.localStorage.setItem('styleher-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    // MongoDB uses _id, convert to id for consistency
    const productWithId = { ...product, id: product._id || product.id };
    setItems((current) => {
      const existing = current.find((item) => item.id === productWithId.id);
      if (existing) {
        return current.map((item) =>
          item.id === productWithId.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { ...productWithId, quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const quantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, quantity, total, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
