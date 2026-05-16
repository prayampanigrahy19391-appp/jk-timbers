'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Truck } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="bg-white dark:bg-timber-900 rounded-3xl p-8 md:p-12 border border-wood-100 dark:border-timber-800 shadow-xl max-w-2xl w-full text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} />
      </div>
      
      <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-4">
        Order Confirmed!
      </h1>
      
      <p className="text-lg text-timber-600 dark:text-timber-400 mb-2">
        Thank you for your order. We are preparing it for dispatch.
      </p>
      
      {orderId && (
        <div className="bg-wood-50 dark:bg-timber-950 border border-wood-200 dark:border-timber-700 rounded-xl p-4 my-6 inline-block">
          <p className="text-sm text-timber-500 uppercase font-bold tracking-wider mb-1">Your Order ID</p>
          <p className="text-2xl font-bold text-wood-950 dark:text-white font-mono">{orderId}</p>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Link 
          href="/track"
          className="bg-wood-950 hover:bg-wood-800 text-white font-bold py-4 px-12 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          <Truck size={20} /> Track Delivery
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-wood-950 dark:text-white">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
