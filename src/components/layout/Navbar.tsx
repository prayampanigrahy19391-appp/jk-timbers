'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';
import ProfileWidget from '@/components/profile/ProfileWidget';

export default function Navbar() {
  const { toggleCart, itemCount } = useCart();

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-wood-200 transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
              <Image 
                src="/logo.jpg" 
                alt="JK Timber Logo" 
                fill 
                sizes="56px" 
                className="object-contain rounded-full bg-white shadow-sm border border-wood-100" 
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl md:text-2xl font-black text-[#1a1105] tracking-tight leading-none">
                JK TIMBER
              </span>
              <span className="text-[9px] md:text-[10px] tracking-wider text-[#543b1f] font-bold uppercase mt-1">
                Wooden Works • WPC • Interiors
              </span>
            </div>
          </Link>

          {/* Right Actions: Cart & Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={toggleCart} 
              className="relative p-2.5 text-[#3a2a1a] hover:text-[#dba24a] hover:bg-wood-50 rounded-full transition-all"
              aria-label="Open Cart"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#dba24a] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
            <div className="border-l border-wood-200 h-6 mx-1 hidden sm:block" />
            <ProfileWidget />
          </div>
        </div>
      </div>
    </nav>
  );
}

