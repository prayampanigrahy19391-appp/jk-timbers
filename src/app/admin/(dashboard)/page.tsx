import { PrismaClient } from '@prisma/client';
import { ShoppingCart, TrendingUp, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';
import AdminTodoCheckbox from './AdminTodoCheckbox';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const [ordersCount, pendingOrdersCount, totalRevenue, lowStockProducts, usersCount, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' }
    }),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
    prisma.user.count(),
    prisma.order.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const revenue = totalRevenue._sum.total || 0;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Warehouse Overview</h1>
        <p className="text-timber-500">Live inventory and order statistics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-timber-500 font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">{pendingOrdersCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-timber-500 font-medium">Paid Revenue</p>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">₹{revenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-timber-500 font-medium">Low Stock Items</p>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">{lowStockProducts}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-timber-500 font-medium">Registered Users</p>
            <p className="text-2xl font-bold text-wood-950 dark:text-white">{usersCount}</p>
          </div>
        </div>
      </div>

      {/* Today's To-Do List */}
      <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-wood-100 dark:border-timber-800 flex justify-between items-center bg-wood-50 dark:bg-timber-950/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-accent" size={20} />
            <h3 className="font-bold text-wood-950 dark:text-white text-lg">Action Required (To-Do List)</h3>
          </div>
          <span className="text-xs font-bold bg-accent/20 text-accent px-3 py-1 rounded-full">{recentOrders.length} Pending</span>
        </div>
        
        <div className="divide-y divide-wood-100 dark:divide-timber-800">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3 opacity-50" />
              <p className="text-timber-500 font-medium">All caught up! No pending orders.</p>
            </div>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="p-6 hover:bg-wood-50 dark:hover:bg-timber-800/30 transition-colors flex items-start gap-4">
                <div className="mt-1">
                  <AdminTodoCheckbox orderId={order.id} status={order.status} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-wood-950 dark:text-white text-lg">{order.customerName || 'Guest Customer'}</h4>
                      <p className="text-sm text-timber-500 font-mono">{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-lg font-black text-wood-950 dark:text-white">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-timber-600 dark:text-timber-400 bg-wood-50 dark:bg-timber-950 p-3 rounded-lg border border-wood-100 dark:border-timber-800">
                    <p><span className="font-medium">Deliver to:</span> {order.deliveryAddress}, {order.city} {order.zipCode}</p>
                    <p><span className="font-medium">Contact:</span> {order.phone}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
