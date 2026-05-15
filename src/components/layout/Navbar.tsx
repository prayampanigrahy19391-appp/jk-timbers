'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingCart, User, Phone, Truck } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';

export default function Navbar() {
  const { toggleCart, itemCount } = useCart();
  return (
    <nav className="fixed w-full z-50 bg-white border-b border-wood-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                <Image src="/logo.jpg" alt="JK Timber Logo" fill className="object-contain rounded-full bg-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl md:text-2xl font-bold text-wood-900 dark:text-wood-100 tracking-tight leading-none">
                  JK TIMBER
                </span>
                <span className="text-[10px] tracking-wider text-wood-600 dark:text-wood-400 font-semibold uppercase mt-0.5">
                  Wooden Works • WPC • Interiors
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-wood-800 dark:text-wood-200 hover:text-accent font-medium text-sm transition-colors">Home</Link>
            <Link href="/catalog" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">Products</Link>
            <Link href="/visualizer" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">3D Visualizer</Link>
            <Link href="/calculator" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">Calculator</Link>
            <Link href="/market" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">Market Prices</Link>
            <Link href="/contractors" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">Bulk Orders</Link>
            <Link href="/track" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors flex items-center gap-1"><Truck size={14} /> Track Order</Link>
            <Link href="/contact" className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">Contact Us</Link>
          </div>

          {/* Call Action & Cart */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleCart} 
              className="relative p-2 text-wood-800 dark:text-wood-200 hover:text-accent transition-colors"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-accent text-wood-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <a href="tel:+918260761620" className="flex items-center gap-2 bg-[#6b4c2a] hover:bg-[#5a3f22] text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md">
              <Phone size={16} />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile menu button & Cart */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleCart} 
              className="relative p-2 text-wood-800 dark:text-wood-200 hover:text-accent transition-colors"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-accent text-wood-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button className="text-foreground hover:text-wood-600 dark:hover:text-wood-300 focus:outline-none">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
