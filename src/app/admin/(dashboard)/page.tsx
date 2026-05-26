import { getAdminDashboardData } from '@/services/orderService';
import { getInventoryStockForecasts } from '@/services/forecastingService';
import { ShoppingCart, TrendingUp, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';
import AdminTodoCheckbox from './AdminTodoCheckbox';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const dashboardData = await getAdminDashboardData();
  const { pendingOrdersCount, revenue, lowStockProducts, usersCount, recentOrders } = dashboardData;
  const forecasts = await getInventoryStockForecasts(8);

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
            <p className="text-2xl font-bold text-wood-950 dark:text-white">₹{(revenue || 0).toLocaleString('en-IN')}</p>
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
                      ₹{order.total.toNumber().toLocaleString('en-IN')}
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

      {/* Inventory Depletion & Demand Forecast Alerts */}
      <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-wood-100 dark:border-timber-800 flex justify-between items-center bg-wood-50 dark:bg-timber-950/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-accent" size={20} />
            <h3 className="font-bold text-wood-950 dark:text-white text-lg">Inventory Depletion & Restock Forecasts</h3>
          </div>
          <span className="text-xs font-bold bg-accent/20 text-accent px-3 py-1 rounded-full">{forecasts.length} Tracked</span>
        </div>

        <div className="p-4 md:p-6">
          {forecasts.length === 0 ? (
            <p className="text-timber-500 text-sm">No forecast data available.</p>
          ) : (
            <div>
              {/* Mobile Cards (hidden on desktop) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {forecasts.map((f) => (
                  <div key={f.productId} className="bg-wood-50 dark:bg-timber-950 p-4 rounded-xl border border-wood-100 dark:border-timber-800 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-wood-950 dark:text-white text-sm">{f.name}</div>
                        <div className="text-xs text-timber-500 font-mono">{f.sku}</div>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.alertLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : f.alertLevel === 'WARN'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {f.alertLevel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-wood-100/50 dark:border-timber-800/50 pt-2 text-timber-600 dark:text-timber-400">
                      <div>
                        <span className="text-timber-400 block text-[9px] uppercase tracking-wider font-semibold">Current Stock</span>
                        <span className="font-bold text-wood-950 dark:text-white">{f.currentStock} units</span>
                      </div>
                      <div>
                        <span className="text-timber-400 block text-[9px] uppercase tracking-wider font-semibold">Weekly Burn</span>
                        <span className="font-semibold text-wood-950 dark:text-white">{f.weeklyBurnRate} / week</span>
                      </div>
                      <div>
                        <span className="text-timber-400 block text-[9px] uppercase tracking-wider font-semibold">Est. Depletion</span>
                        <span>
                          {f.estimatedDepletionDays === 999 ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold">Stable (&gt;90d)</span>
                          ) : (
                            <span className={f.estimatedDepletionDays <= 7 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                              {f.estimatedDepletionDays} days
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-timber-400 block text-[9px] uppercase tracking-wider font-semibold">Suggested Restock</span>
                        <span className="font-bold text-wood-950 dark:text-white">
                          {f.restockRecommendation > 0 ? (
                            <span className="text-accent">+{f.restockRecommendation} units</span>
                          ) : (
                            <span className="text-timber-400 font-normal">Sufficient</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-timber-700 dark:text-timber-300">
                  <thead>
                    <tr className="border-b border-wood-100 dark:border-timber-800 text-timber-500 font-semibold">
                      <th className="pb-3">Product / SKU</th>
                      <th className="pb-3">Current Stock</th>
                      <th className="pb-3">Weekly Burn Rate</th>
                      <th className="pb-3">Est. Depletion</th>
                      <th className="pb-3">Alert Level</th>
                      <th className="pb-3 text-right">Suggested Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100 dark:divide-timber-800">
                    {forecasts.map((f) => (
                      <tr key={f.productId} className="hover:bg-wood-50/50 dark:hover:bg-timber-800/10 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-wood-950 dark:text-white">{f.name}</div>
                          <div className="text-xs text-timber-500 font-mono">{f.sku}</div>
                        </td>
                        <td className="py-4 font-semibold">{f.currentStock}</td>
                        <td className="py-4">{f.weeklyBurnRate} / week</td>
                        <td className="py-4">
                          {f.estimatedDepletionDays === 999 ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">Stable (&gt;90 days)</span>
                          ) : (
                            <span className={f.estimatedDepletionDays <= 7 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                              {f.estimatedDepletionDays} days
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            f.alertLevel === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : f.alertLevel === 'WARN'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {f.alertLevel}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-wood-950 dark:text-white">
                          {f.restockRecommendation > 0 ? (
                            <span className="text-accent">+{f.restockRecommendation} units</span>
                          ) : (
                            <span className="text-timber-400 font-normal">Sufficient</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
