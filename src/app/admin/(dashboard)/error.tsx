'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="text-red-500 mb-6" size={48} />
      <h2 className="text-2xl font-bold text-wood-950 dark:text-white mb-3">Dashboard Error</h2>
      <p className="text-timber-500 mb-6 max-w-md">
        Failed to load dashboard data. This could be a database connection issue.
      </p>
      <button
        onClick={reset}
        className="bg-wood-950 hover:bg-wood-800 text-white font-bold py-3 px-8 rounded-xl transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
