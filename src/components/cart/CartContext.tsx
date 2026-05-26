'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
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
  cartToken: string | null;
}

type ServerCartItem = {
  sku: string;
  name: string;
  price: string | number;
  unit: string;
  image: string;
  quantity: number;
};

type ServerCart = {
  token?: string;
  items?: ServerCartItem[];
};

type CartApiResponse = {
  cart?: ServerCart | null;
  error?: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function displayPrice(price: unknown) {
  const raw = String(price ?? '');
  if (raw.startsWith('₹')) return raw;
  const value = parsePrice(raw);
  return value > 0 ? `₹${value.toLocaleString('en-IN')}` : raw;
}

function mapServerItems(items: ServerCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.sku,
    name: item.name,
    price: displayPrice(item.price),
    unit: item.unit,
    image: item.image,
    quantity: item.quantity,
  }));
}

function cartItemsMatch(left: CartItem[], right: CartItem[]) {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return (
        other &&
        item.id === other.id &&
        item.name === other.name &&
        item.price === other.price &&
        item.unit === other.unit &&
        item.image === other.image &&
        item.quantity === other.quantity
      );
    })
  );
}

async function readCartApiResponse(response: Response): Promise<CartApiResponse | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToken, setCartToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSyncedItemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('jk-timbers-cart');
    const savedToken = localStorage.getItem('jk-timbers-cart-token');

    if (savedCart) {
      try {
        // eslint-disable-next-line
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
        lastSyncedItemsRef.current = parsed;
      } catch (error) {
        localStorage.removeItem('jk-timbers-cart');
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to load saved cart:', error);
        }
      }
    }

    if (savedToken) {
      setCartToken(savedToken);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('jk-timbers-cart', JSON.stringify(items));
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !cartToken) return;
    localStorage.setItem('jk-timbers-cart-token', cartToken);
  }, [cartToken, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !cartToken || items.length > 0) return;

    fetch(`/api/cart?token=${encodeURIComponent(cartToken)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.cart?.items?.length) {
          const loadedItems = mapServerItems(data.cart.items);
          setItems(loadedItems);
          lastSyncedItemsRef.current = loadedItems;
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to restore server cart:', error);
        }
      });
  }, [cartToken, isInitialized, items.length]);

  useEffect(() => {
    if (!isInitialized || (items.length === 0 && !cartToken)) return;

    // Skip network request if local state matches the last successfully synced state
    if (cartItemsMatch(items, lastSyncedItemsRef.current)) {
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      const payload = {
        token: cartToken,
        items: items.map((item) => ({
          sku: item.id,
          quantity: item.quantity,
        })),
      };

      let response: Response;
      try {
        response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to sync cart:', error);
        }
        return;
      }

      if (!active) return;

      const data = await readCartApiResponse(response);
      if (!response.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(data?.error ?? 'Unable to synchronize cart.');
        }
        return;
      }

      if (data?.cart?.token && data.cart.token !== cartToken) {
        setCartToken(data.cart.token);
      }

      if (data?.cart?.items) {
        const serverItems = mapServerItems(data.cart.items);
        lastSyncedItemsRef.current = serverItems;
        setItems((currentItems) => (
          cartItemsMatch(currentItems, serverItems) ? currentItems : serverItems
        ));
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [items, cartToken, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const clearCart = () => {
    setItems([]);
    lastSyncedItemsRef.current = [];
    setCartToken(null);
    localStorage.removeItem('jk-timbers-cart');
    localStorage.removeItem('jk-timbers-cart-token');
  };

  const cartTotal = useMemo(
    () =>
      items.reduce((total, item) => {
        return total + parsePrice(item.price) * item.quantity;
      }, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

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
        cartToken,
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
