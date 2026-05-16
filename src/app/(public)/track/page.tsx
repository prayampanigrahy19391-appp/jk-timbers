'use client';

import { useState } from 'react';
import { Search, PackageSearch, Truck, CheckCircle2, Clock } from 'lucide-react';
import type { OrderSummary } from '@/types/order';
import { motion } from 'framer-motion';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderSummary | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);
    
    try {
      const res = await fetch(`/api/track/${orderId.trim()}`);
      if (!res.ok) {
        throw new Error('Order not found. Please check your Order ID.');
      }
      const data = await res.json();
      setOrderData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-50 dark:bg-timber-950 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <PackageSearch className="mx-auto text-accent mb-4" size={56} />
          <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-4">Track Your Timber</h1>
          <p className="text-timber-600 dark:text-timber-400">Enter your Order ID below to get real-time delivery status updates.</p>
        </div>

        <div className="bg-white dark:bg-timber-900 rounded-3xl shadow-xl border border-wood-100 dark:border-timber-800 overflow-hidden">
          <div className="p-8 border-b border-wood-100 dark:border-timber-800">
            <form onSubmit={handleTrack} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-timber-400" size={20} />
                <input 
                  type="text" 
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. cln1234567890abcdef" 
                  className="w-full bg-wood-50 dark:bg-timber-950 border border-wood-200 dark:border-timber-700 rounded-2xl py-4 pl-12 pr-32 text-wood-950 dark:text-white font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-2 bg-wood-950 dark:bg-wood-800 hover:bg-wood-800 dark:hover:bg-wood-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl transition-colors"
                >
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </div>
              {error && <p className="mt-3 text-red-500 text-sm text-center font-medium">{error}</p>}
            </form>
          </div>

          {orderData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-wood-50/50 dark:bg-timber-950/50"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-1">Order Details</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-timber-500 text-sm font-mono">ID: {orderData.id}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      orderData.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      orderData.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {orderData.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-timber-500">Ordered by <span className="font-bold text-wood-900 dark:text-white">{orderData.customerName || 'Guest'}</span></p>
                  <p className="text-xs text-timber-400 mt-1">{new Date(orderData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative py-8">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-wood-200 dark:bg-timber-800 -translate-y-1/2 z-0 rounded-full" />
                
                {/* Progress Line */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                  style={{ 
                    width: orderData.status === 'PENDING' ? '15%' : 
                           orderData.status === 'SHIPPED' ? '50%' : 
                           orderData.status === 'DELIVERED' ? '100%' : '0%'
                  }}
                />

                <div className="relative z-10 flex justify-between items-center px-2 sm:px-6">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                      ['PENDING', 'SHIPPED', 'DELIVERED'].includes(orderData.status) 
                        ? 'bg-accent border-yellow-200 dark:border-yellow-900/30 text-wood-950' 
                        : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                    }`}>
                      <Clock size={20} />
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Processing</p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                      ['SHIPPED', 'DELIVERED'].includes(orderData.status) 
                        ? 'bg-accent border-yellow-200 dark:border-yellow-900/30 text-wood-950' 
                        : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                    }`}>
                      <Truck size={20} />
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Dispatched</p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                      orderData.status === 'DELIVERED' 
                        ? 'bg-green-500 border-green-200 dark:border-green-900/30 text-white' 
                        : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                    }`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Delivered</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                {orderData.status === 'PENDING' && <p className="text-timber-600 dark:text-timber-400">Your order is currently being processed at our warehouse. We will dispatch it shortly.</p>}
                {orderData.status === 'SHIPPED' && <p className="text-yellow-600 dark:text-yellow-500 font-medium">Your timber is on the truck! Our driver will contact you prior to arrival.</p>}
                {orderData.status === 'DELIVERED' && <p className="text-green-600 dark:text-green-500 font-medium">This order has been successfully delivered. Thank you for choosing JK Timbers!</p>}
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
