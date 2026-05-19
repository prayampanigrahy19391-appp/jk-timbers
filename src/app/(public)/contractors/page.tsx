'use client';

import { useState } from 'react';
import { Building2, ShieldCheck, FileText, ArrowRight, Package, CheckCircle } from 'lucide-react';

export default function ContractorsPortal() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', company: '', gstNumber: '', email: '', phone: '', city: '', businessType: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/contractors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message || data.error });
      if (data.success) setFormData({ firstName: '', lastName: '', company: '', gstNumber: '', email: '', phone: '', city: '', businessType: '' });
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Registration Area */}
        <div className="bg-wood-950 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-serif font-bold text-white mb-4">Partner With Us</h2>
              <p className="text-wood-300 mb-8">Join our network of over 500+ trusted contractors and builders across India.</p>
              
              {result && (
                <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
                  result.success
                    ? 'bg-green-900/20 border-green-800 text-green-400'
                    : 'bg-red-900/20 border-red-800 text-red-400'
                }`}>
                  {result.success && <CheckCircle className="inline mr-2" size={16} />}
                  {result.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" required placeholder="First Name *" value={formData.firstName} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                </div>
                <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                <input type="text" name="gstNumber" placeholder="GST Number" value={formData.gstNumber} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                <input type="email" name="email" required placeholder="Email Address *" value={formData.email} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                </div>
                <input type="text" name="businessType" placeholder="Business Type (Builder, Architect, Contractor)" value={formData.businessType} onChange={handleChange} className="w-full p-4 rounded-xl bg-wood-900 border border-wood-800 text-white placeholder-wood-500 focus:outline-none focus:border-accent" />
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-yellow-500 disabled:opacity-50 text-wood-950 font-bold py-4 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Submitting...' : 'Apply for Partner Account'} <ArrowRight size={20} />
                </button>
              </form>
            </div>

            <div className="relative hidden lg:block bg-timber-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888087-b552c6f6004b?q=80&w=1024')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-wood-950"></div>
              
              <div className="relative h-full flex flex-col justify-center p-16">
                <blockquote className="text-2xl font-serif text-white italic leading-relaxed mb-6">
                  &quot;Switching our bulk timber procurement to JK Timbers was the best decision for our construction firm. The consistent quality and timely deliveries have saved us both time and money.&quot;
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
