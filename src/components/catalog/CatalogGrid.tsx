'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search, ChevronDown, ShoppingCart } from 'lucide-react';
import { products as mockProducts } from '@/data/products';
import { useCart } from '@/components/cart/CartContext';

const categories = ['All', 'Timber', 'Plywood', 'Engineered', 'Veneers', 'Laminates', 'Doors'];

export function CatalogGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const filteredProducts = mockProducts.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-wood-50 mb-3">Product Catalog</h1>
            <p className="text-timber-600 dark:text-timber-400">Browse our extensive collection of premium timber and plywood.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-timber-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-900 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-wood-100 dark:border-timber-800">
                <Filter size={20} className="text-wood-600 dark:text-wood-400" />
                <h3 className="font-bold text-wood-950 dark:text-white">Categories</h3>
              </div>
              
              <ul className="space-y-3">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left flex justify-between items-center transition-colors ${
                        activeCategory === cat 
                          ? 'text-wood-600 dark:text-accent font-bold' 
                          : 'text-timber-600 dark:text-timber-400 hover:text-wood-950 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && <ChevronDown size={16} className="-rotate-90" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-timber-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-timber-800 group hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10 bg-accent text-wood-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {product.badge}
                      </div>
                    )}
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-wood-500 dark:text-wood-400 mb-2">{product.category}</p>
                    <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-4 line-clamp-1">{product.name}</h3>
                    
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <span className="text-2xl font-bold text-wood-700 dark:text-wood-300">{product.price}</span>
                        <span className="text-sm text-timber-500 dark:text-timber-400 ml-1">/{product.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Link href={`/catalog/${product.id}`} className="flex-1 bg-timber-100 dark:bg-timber-800 hover:bg-wood-600 hover:text-white text-wood-950 dark:text-white font-medium py-3 rounded-xl transition-colors inline-block text-center text-sm">
                        Details
                      </Link>
                      <button 
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          image: product.image
                        })}
                        className="flex-1 bg-accent hover:bg-yellow-500 text-wood-950 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingCart size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-timber-500 text-lg">No products found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
