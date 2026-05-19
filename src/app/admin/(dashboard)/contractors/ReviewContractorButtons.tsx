'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReviewContractorButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [error, setError] = useState('');

  const review = async (status: 'APPROVED' | 'REJECTED') => {
    setLoadingAction(status);
    setError('');
    try {
      const response = await fetch(`/api/admin/contractors/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          discountRate: status === 'APPROVED' ? discountRate : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Unable to review contractor application.');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error while reviewing contractor application.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-timber-600 dark:text-timber-300">
          Discount %
          <input
            type="number"
            min={0}
            max={100}
            value={discountRate}
            onChange={(event) => setDiscountRate(Number(event.target.value))}
            className="w-20 rounded-lg border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 px-2 py-1 text-wood-950 dark:text-white"
          />
        </label>
        <button
          type="button"
          disabled={!!loadingAction}
          onClick={() => review('APPROVED')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          <CheckCircle2 size={16} /> {loadingAction === 'APPROVED' ? 'Approving...' : 'Approve'}
        </button>
        <button
          type="button"
          disabled={!!loadingAction}
          onClick={() => review('REJECTED')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          <XCircle size={16} /> {loadingAction === 'REJECTED' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}
