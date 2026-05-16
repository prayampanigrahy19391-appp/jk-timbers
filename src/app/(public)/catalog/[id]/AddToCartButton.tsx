'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: string;
    unit: string;
    image: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    addToCart(product);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-wood-100 dark:border-timber-800">
      <button 
        onClick={() => addToCart(product)}
        className="flex-1 bg-wood-950 hover:bg-wood-800 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        <ShoppingCart size={20} /> Add to Cart
      </button>
      <button 
        onClick={handleBuyNow}
        className="flex-1 bg-accent hover:bg-yellow-500 text-wood-950 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg text-center"
      >
        Buy Now
      </button>
    </div>
  );
}
