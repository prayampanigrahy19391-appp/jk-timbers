'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isEmail = formData.identifier.includes('@');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: isEmail ? formData.identifier : '',
          phone: !isEmail ? formData.identifier : '',
          password: formData.password,
        }),
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
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="John Doe" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Email or Phone Number</label>
            <input 
              type="text" 
              required
              value={formData.identifier}
              onChange={e => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="john@example.com or 1234567890" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Password</label>
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
