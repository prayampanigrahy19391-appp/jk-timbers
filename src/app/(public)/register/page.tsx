'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Form Validations
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setError('Name can only contain letters and spaces.');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.city)) {
      setError('City name can only contain letters and spaces.');
      setIsLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(formData.zipCode)) {
      setError('PIN/Zip Code must be exactly 6 digits.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('A network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-50 dark:bg-timber-950 flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-white dark:bg-timber-900 rounded-2xl shadow-xl p-8 border border-wood-100 dark:border-timber-800">
        <h1 className="text-2xl font-serif font-bold text-wood-950 dark:text-white mb-2 text-center">Create an Account</h1>
        <p className="text-wood-500 dark:text-timber-400 text-center mb-8">Join JK Timbers for a personalized experience.</p>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Full Name *</label>
            <input 
              type="text" 
              required
              pattern="^[a-zA-Z\s]+$"
              title="Name can only contain letters and spaces"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="John Doe" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Email Address *</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
                placeholder="john@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                required
                pattern="^\d{10}$"
                maxLength={10}
                title="Phone number must be exactly 10 digits"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
                placeholder="e.g. 9876543210" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Street Address *</label>
            <input 
              type="text" 
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="123 Main St, Appt/Suite" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">City *</label>
              <input 
                type="text" 
                required
                pattern="^[a-zA-Z\s]+$"
                title="City name can only contain letters and spaces"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
                placeholder="Bhubaneswar" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">PIN / Zip Code *</label>
              <input 
                type="text" 
                required
                pattern="^\d{6}$"
                maxLength={6}
                title="PIN/Zip code must be exactly 6 digits"
                value={formData.zipCode}
                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
                placeholder="751001" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Password *</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-wood-950 hover:bg-wood-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-wood-500 text-sm">
          Already have an account? <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
