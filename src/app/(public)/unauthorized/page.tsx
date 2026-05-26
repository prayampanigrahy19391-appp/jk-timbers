'use client';

import Link from 'next/link';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function UnauthorizedPage() {
  const handleLogoutAndRedirect = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-wood-50 dark:bg-timber-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-timber-900 border border-wood-200 dark:border-timber-800 rounded-3xl p-8 shadow-xl text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
          <ShieldAlert size={36} />
        </div>
        
        <h1 className="text-2xl font-serif font-black text-wood-950 dark:text-white mb-3">
          Access Denied
        </h1>
        
        <p className="text-timber-600 dark:text-timber-400 text-sm mb-8 leading-relaxed">
          Your account does not have permission to access this area. If you are trying to manage the store, please log out and sign in with your admin credentials.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogoutAndRedirect}
            className="w-full py-4 px-6 bg-gradient-to-r from-accent to-yellow-600 text-wood-950 font-bold rounded-xl shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} /> Sign in as Admin
          </button>
          
          <Link
            href="/"
            className="w-full py-4 px-6 border border-wood-200 dark:border-timber-800 text-timber-700 dark:text-timber-300 hover:bg-wood-50 dark:hover:bg-timber-800/30 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
