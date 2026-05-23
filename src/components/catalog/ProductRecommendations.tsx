'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Sparkles, Loader2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';

type Product = {
  id: string;
  name: string;
  slug: string;
  basePrice: string | number;
  unit: string;
  images: any;
  badge?: string;
  description: string;
};

export default function ProductRecommendations({ currentProductId }: { currentProductId: string }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchRecs() {
      try {
        const res = await fetch(`/api/recommendations?viewedProductIds=${encodeURIComponent(currentProductId)}&limit=4`);
        if (res.ok) {
          const body = await res.json();
          if (body.success && Array.isArray(body.data)) {
            setRecommendations(body.data);
          }
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecs();
  }, [currentProductId]);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-wood-100 dark:border-timber-800 pt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
          <Sparkles size={18} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-wood-950 dark:text-white">
          Recommended For You
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => {
          let image = '/textures/teak.webp';
          try {
            const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              image = parsedImages[0];
            }
          } catch {}

          const priceFormatted = typeof product.basePrice === 'number' 
            ? `₹${product.basePrice.toLocaleString('en-IN')}` 
            : `₹${Number(product.basePrice).toLocaleString('en-IN')}`;

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-timber-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-timber-800 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-timber-100 dark:bg-timber-800">
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10 bg-accent text-wood-950 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {product.badge}
                  </div>
                )}
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-wood-950 dark:text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-timber-500 text-xs line-clamp-2 mb-4">
                    {product.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-extrabold text-wood-700 dark:text-wood-300">
                      {priceFormatted}
                    </span>
                    <span className="text-xs text-timber-500">/{product.unit}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/catalog/${product.slug}`}
                      className="flex-1 bg-timber-100 dark:bg-timber-800 hover:bg-wood-600 hover:text-white text-wood-950 dark:text-white font-semibold py-2 rounded-lg transition-colors text-center text-xs"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() =>
                        addToCart({
                          id: product.slug,
                          name: product.name,
                          price: priceFormatted,
                          unit: product.unit,
                          image,
                        })
                      }
                      className="flex-1 bg-accent hover:bg-yellow-500 text-wood-950 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs"
                    >
                      <ShoppingCart size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
