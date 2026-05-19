'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const nextStatuses: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
};

export default function UpdateStatusButton({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState(nextStatuses[status]?.[0] ?? '');
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (!nextStatus) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        router.refresh(); // Refresh the server component to get new data
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Failed to update status.');
      }
    } catch {
      setError('Network error while updating status.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!nextStatuses[status]?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          className="rounded-lg border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 px-3 py-2 text-sm font-medium text-wood-950 dark:text-white"
        >
          {nextStatuses[status].map((candidate) => (
            <option key={candidate} value={candidate}>{candidate}</option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="bg-wood-950 hover:bg-wood-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <CheckCircle2 size={16} /> {isLoading ? 'Saving...' : 'Update'}
        </button>
      </div>
      {error && <p className="max-w-xs text-sm font-medium text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}
