"use client";

import * as React from "react";
import type { CartItem } from "@workspace/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

/**
 * Guarda o carrinho só em memória — sem persistência, sem backend, sem
 * pagamentos. É só a estrutura suficiente para uma futura página de
 * carrinho e checkout construírem em cima.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = React.useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        );
      }
      return [...current, item];
    });
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const value = React.useMemo(
    () => ({ items, addItem, removeItem, clear }),
    [items, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}