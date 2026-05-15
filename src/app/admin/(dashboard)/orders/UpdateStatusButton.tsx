'use client';

import { Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UpdateStatusButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SHIPPED' })
      });
      if (res.ok) {
        router.refresh(); // Refresh the server component to get new data
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={isLoading}
      className="bg-wood-950 hover:bg-wood-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
    >
      <Truck size={16} /> {isLoading ? 'Updating...' : 'Mark Dispatched'}
    </button>
  );
}
