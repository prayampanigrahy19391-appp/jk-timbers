'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Phone, Truck } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileWidget from '@/components/profile/ProfileWidget';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Products' },
  { href: '/visualizer', label: '3D Visualizer' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/contractors', label: 'Bulk Orders' },
  { href: '/track', label: 'Track Order' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const { toggleCart, itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed w-full z-50 bg-white border-b border-wood-200 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Profile */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <ProfileWidget />
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                  <Image src="/logo.jpg" alt="JK Timber Logo" fill sizes="64px" className="object-contain rounded-full bg-white" />
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
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-wood-500 dark:text-wood-400 hover:text-accent font-medium text-sm transition-colors">
                  {link.label === 'Track Order' ? (
                    <span className="flex items-center gap-1"><Truck size={14} /> {link.label}</span>
                  ) : link.label}
                </Link>
              ))}
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
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-foreground hover:text-wood-600 dark:hover:text-wood-300 focus:outline-none"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-timber-950 shadow-2xl z-[56] md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-wood-200 dark:border-timber-800">
                <span className="font-serif text-xl font-bold text-wood-900 dark:text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-wood-500 hover:text-wood-900 dark:hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-wood-700 dark:text-wood-300 hover:bg-wood-50 dark:hover:bg-timber-900 hover:text-accent font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-wood-200 dark:border-timber-800">
                <a href="tel:+918260761620" className="w-full flex items-center justify-center gap-2 bg-[#6b4c2a] hover:bg-[#5a3f22] text-white px-5 py-3 rounded-full font-medium transition-all shadow-md">
                  <Phone size={16} /> Call Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
