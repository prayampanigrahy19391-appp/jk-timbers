'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="text-red-500 mb-6" size={56} />
      <h2 className="text-3xl font-serif font-bold text-wood-950 dark:text-white mb-4">Something went wrong</h2>
      <p className="text-timber-600 dark:text-timber-400 mb-8 max-w-md">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <button
        onClick={reset}
        className="bg-wood-950 hover:bg-wood-800 text-white font-bold py-3 px-8 rounded-xl transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
