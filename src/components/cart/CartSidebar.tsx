'use client';

import { useCart } from './CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar() {
  const { items, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-wood-950/50 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white dark:bg-timber-950 shadow-2xl z-[70] flex flex-col border-l border-wood-200 dark:border-timber-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-wood-100 dark:border-timber-800">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-accent" size={24} />
                <h2 className="text-2xl font-serif font-bold text-wood-950 dark:text-white">Your Cart</h2>
                <span className="bg-wood-100 dark:bg-timber-800 text-wood-600 dark:text-timber-300 px-2 py-0.5 rounded-full text-sm font-bold">
                  {items.length}
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-wood-100 dark:hover:bg-timber-800 rounded-full transition-colors text-wood-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-timber-500">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p className="text-xl font-medium mb-2 text-wood-900 dark:text-white">Your cart is empty</p>
                  <p className="mb-6">Browse our catalog to find premium wood products.</p>
                  <button 
                    onClick={toggleCart}
                    className="bg-wood-950 hover:bg-wood-800 text-white px-6 py-3 rounded-full font-bold transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-timber-100 dark:bg-timber-800 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-wood-950 dark:text-white line-clamp-1">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-timber-400 hover:text-red-500 transition-colors p-1">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-accent font-bold mb-3">{item.price} <span className="text-xs text-timber-500 font-normal">/ {item.unit}</span></p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-wood-200 dark:border-timber-700 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 bg-wood-50 dark:bg-timber-900 hover:bg-wood-100 dark:hover:bg-timber-800 text-wood-600 dark:text-timber-400 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-medium text-wood-900 dark:text-white text-sm">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 bg-wood-50 dark:bg-timber-900 hover:bg-wood-100 dark:hover:bg-timber-800 text-wood-600 dark:text-timber-400 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-wood-100 dark:border-timber-800 bg-wood-50 dark:bg-timber-950">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-timber-600 dark:text-timber-400 font-medium">Estimated Total</span>
                  <span className="text-2xl font-black text-wood-950 dark:text-white">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <Link href="/checkout" onClick={toggleCart} className="w-full bg-accent hover:bg-yellow-500 text-wood-950 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-accent/20">
                  Proceed to Checkout <ArrowRight size={20} />
                </Link>
                <p className="text-xs text-center text-timber-500 mt-4">
                  Final pricing may vary based on delivery location and bulk discounts.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
