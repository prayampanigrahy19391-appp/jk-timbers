'use client';

import { useCart } from '@/components/cart/CartContext';
import { ShoppingCart } from 'lucide-react';

export function HeroCartButton() {
  const { toggleCart } = useCart();
  
  return (
    <button onClick={toggleCart} className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
      <ShoppingCart size={16} /> View Cart
    </button>
  );
}
