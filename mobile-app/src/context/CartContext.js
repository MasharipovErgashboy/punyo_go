import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {product, quantity, restaurant}

  const addItem = useCallback((product, restaurant, onNeedSwitch) => {
    setItems((prev) => {
      // Enforce single-restaurant cart
      if (prev.length > 0 && prev[0].restaurant?.id !== restaurant?.id) {
        if (onNeedSwitch) { onNeedSwitch(); return prev; }
        return [{ product, quantity: 1, restaurant }];
      }
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { product, quantity: 1, restaurant }];
    });
  }, []);

  const replaceWith = useCallback((product, restaurant) => {
    setItems([{ product, quantity: 1, restaurant }]);
  }, []);

  const setQty = useCallback((productId, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0), [items]);
  const restaurant = items[0]?.restaurant || null;

  return (
    <CartContext.Provider value={{ items, addItem, replaceWith, setQty, clear, count, total, restaurant }}>
      {children}
    </CartContext.Provider>
  );
}
