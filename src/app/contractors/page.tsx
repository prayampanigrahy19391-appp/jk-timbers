'use client';

import { Building2, ShieldCheck, FileText, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

export default function ContractorsPortal() {
  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Building2 className="mx-auto text-accent mb-6" size={48} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-6">
            Bulk Order & Contractor Portal
          </h1>
          <p className="text-xl text-timber-600 dark:text-timber-400">
            Exclusive pricing, GST invoicing, and dedicated support for Builders, Architects, and Interior Designers.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-timber-900 p-8 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm hover:shadow-md transition-shadow">
            <ShieldCheck className="text-wood-600 dark:text-accent mb-4" size={32} />
            <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-3">Special Dealer Pricing</h3>
            <p className="text-timber-600 dark:text-timber-400">Unlock wholesale rates and volume-based discounts for your ongoing projects.</p>
          </div>
          <div className="bg-white dark:bg-timber-900 p-8 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm hover:shadow-md transition-shadow">
            <FileText className="text-wood-600 dark:text-accent mb-4" size={32} />
            <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-3">GST Invoices & Reports</h3>
            <p className="text-timber-600 dark:text-timber-400">Automated B2B invoicing with GST input credit support. Track all your project expenses.</p>
          </div>
          <div className="bg-white dark:bg-timber-900 p-8 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm hover:shadow-md transition-shadow">
            <Package className="text-wood-600 dark:text-accent mb-4" size={32} />
            <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-3">Priority Delivery</h3>
            <p className="text-timber-600 dark:text-timber-400">Dedicated logistics and unloading support to ensure your materials arrive on time, every time.</p>
          </div>
        </div>

        {/* Login / Registration Area */}
        <div className="bg-wood-950 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-serif font-bold text-white mb-4">Partner With Us</h2>
              <p className="text-wood-300 mb-8">Join our network of over 500+ trusted contractors and builders across India.</p>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                  <input type="text" placeholder="Last Name" className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                </div>
                <input type="text" placeholder="Company Name" className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                <input type="text" placeholder="GST Number" className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                <input type="email" placeholder="Email Address" className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                
                <button className="w-full bg-accent hover:bg-yellow-500 text-wood-950 font-bold py-4 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2">
                  Apply for Partner Account <ArrowRight size={20} />
                </button>
              </form>
              
              <div className="mt-8 text-center text-wood-400">
                Already have an account? <Link href="/login" className="text-accent hover:underline font-medium">Log in here</Link>
              </div>
            </div>

            <div className="relative hidden lg:block bg-timber-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888087-b552c6f6004b?q=80&w=1024')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-wood-950"></div>
              
              <div className="relative h-full flex flex-col justify-center p-16">
                <blockquote className="text-2xl font-serif text-white italic leading-relaxed mb-6">
                  "Switching our bulk timber procurement to JK Timbers was the best decision for our construction firm. The consistent quality and timely deliveries have saved us both time and money."
                </blockquote>
                <div>
                  <div className="font-bold text-accent">Rajeev Desai</div>
                  <div className="text-wood-300 text-sm">Managing Director, Desai Builders</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
