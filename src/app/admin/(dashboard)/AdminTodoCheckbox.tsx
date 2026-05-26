'use client';
import { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTodoCheckbox({ orderId, status }: { orderId: string, status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localChecked, setLocalChecked] = useState(status !== 'PENDING');

  const handleToggle = async () => {
    if (localChecked || loading) return;
    setLoading(true);
    setLocalChecked(true); // Optimistic UI update
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED', notes: 'Order confirmed from dashboard action list.' })
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        setLocalChecked(false); // Revert if failed
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update order status: ${errorData.message || res.statusText || 'Unknown error'}`);
      }
    } catch (e) {
      setLocalChecked(false); // Revert if network error
      console.error(e);
      alert(`Network error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input 
        type="checkbox" 
        checked={localChecked}
        onChange={handleToggle}
        disabled={localChecked || loading}
        className={`w-5 h-5 rounded border-wood-300 dark:border-timber-700 ${localChecked ? 'accent-green-500 cursor-not-allowed opacity-50' : 'accent-accent cursor-pointer'}`} 
      />
      {loading && <span className="text-xs text-timber-500 animate-pulse">Updating...</span>}
    </div>
  );
}
