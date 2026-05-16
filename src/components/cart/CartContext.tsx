'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { parsePrice } from '@/utils/price';
import type { CartItem } from '@/types/product';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('jk-timbers-cart');
    if (savedCart) {
      try {
        // eslint-disable-next-line
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('jk-timbers-cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('jk-timbers-cart');
  };

  const cartTotal = useMemo(() => items.reduce((total, item) => {
    return total + (parsePrice(item.price) * item.quantity);
  }, 0), [items]);

  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
