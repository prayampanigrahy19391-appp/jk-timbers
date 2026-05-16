'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        identifier,
        password,
      });

      if (res?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-wood-50 dark:bg-timber-950 flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-white dark:bg-timber-900 rounded-2xl shadow-xl p-8 border border-wood-100 dark:border-timber-800">
        <h1 className="text-2xl font-serif font-bold text-wood-950 dark:text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-wood-500 dark:text-timber-400 text-center mb-8">Sign in to your JK Timbers account.</p>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

        <button 
          onClick={handleGoogleLogin}
          className="w-full mb-6 py-3 px-4 border border-wood-200 dark:border-timber-700 rounded-lg flex items-center justify-center gap-3 hover:bg-wood-50 dark:hover:bg-timber-800 transition-colors text-wood-900 dark:text-white font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6 flex items-center py-2">
          <div className="flex-grow border-t border-wood-200 dark:border-timber-700"></div>
          <span className="flex-shrink-0 mx-4 text-wood-400 text-sm">or sign in with email</span>
          <div className="flex-grow border-t border-wood-200 dark:border-timber-700"></div>
        </div>

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-timber-300 mb-1">Email or Phone Number</label>
            <input 
              type="text" 
              required
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" 
              placeholder="john@example.com or 1234567890" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-wood-700 dark:text-timber-300">Password</label>
              <Link href="/forgot-password" className="text-sm text-accent hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-wood-500 text-sm">
          Don&apos;t have an account? <Link href="/register" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
