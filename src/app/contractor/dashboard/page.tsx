import { auth } from '@/../auth';
import { getCustomerOrders } from '@/services/orderService';
import { prisma } from '@/lib/prisma';
import { Package, Percent, ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContractorDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [orders, application] = userId
    ? await Promise.all([
        getCustomerOrders(userId),
        prisma.contractorApplication.findUnique({ where: { userId } }),
      ])
    : [[], null] as const;

  return (
    <div className="min-h-screen bg-wood-50 px-4 py-10 dark:bg-timber-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-wood-950 dark:text-white">Contractor Dashboard</h1>
          <p className="text-timber-500">Track project orders and your approved contractor account terms.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-wood-100 bg-white p-5 dark:border-timber-800 dark:bg-timber-900">
            <div className="mb-2 flex items-center gap-2 text-timber-500"><ShoppingCart size={18} /> Orders</div>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">{orders.length}</p>
          </div>
          <div className="rounded-lg border border-wood-100 bg-white p-5 dark:border-timber-800 dark:bg-timber-900">
            <div className="mb-2 flex items-center gap-2 text-timber-500"><Percent size={18} /> Pricing</div>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">
              {application?.discountRate ? `${application.discountRate.toNumber()}%` : 'Standard'}
            </p>
          </div>
          <div className="rounded-lg border border-wood-100 bg-white p-5 dark:border-timber-800 dark:bg-timber-900">
            <div className="mb-2 flex items-center gap-2 text-timber-500"><Package size={18} /> Account</div>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">{application?.status ?? 'Pending'}</p>
          </div>
        </div>

        <div className="rounded-lg border border-wood-100 bg-white dark:border-timber-800 dark:bg-timber-900">
          <div className="border-b border-wood-100 px-6 py-4 dark:border-timber-800">
            <h2 className="font-bold text-wood-950 dark:text-white">Order History</h2>
          </div>
          {orders.length === 0 ? (
            <p className="px-6 py-10 text-center text-timber-500">No contractor orders yet.</p>
          ) : (
            <div className="divide-y divide-wood-100 dark:divide-timber-800">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-mono text-sm text-timber-500">{order.orderNumber}</p>
                    <p className="font-bold text-wood-950 dark:text-white">{order.orderItems.length} item{order.orderItems.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-bold text-wood-950 dark:text-white">₹{order.total.toNumber().toLocaleString('en-IN')}</p>
                    <p className="text-sm text-timber-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
