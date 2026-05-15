'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTodoCheckbox({ orderId, status }: { orderId: string, status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isCompleted = status === 'SHIPPED' || status === 'DELIVERED';

  const handleToggle = async () => {
    if (isCompleted || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SHIPPED' })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input 
        type="checkbox" 
        checked={isCompleted}
        onChange={handleToggle}
        disabled={isCompleted || loading}
        className={`w-5 h-5 rounded border-wood-300 dark:border-timber-700 ${isCompleted ? 'accent-green-500 cursor-not-allowed opacity-50' : 'accent-accent cursor-pointer'}`} 
      />
      {loading && <span className="text-xs text-timber-500 animate-pulse">Updating...</span>}
    </div>
  );
}
