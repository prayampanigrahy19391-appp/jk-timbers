import { PrismaClient } from '@prisma/client';
import { Mail, Phone, MapPin, User as UserIcon, TrendingUp, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  // Aggregate orders by customer to create "Customer Profiles"
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const customersMap = new Map();
  
  orders.forEach(order => {
    const key = order.email || order.phone || order.id; // Fallback to order ID if no contact info
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        id: key,
        name: order.customerName || 'Guest Customer',
        email: order.email || 'N/A',
        phone: order.phone || 'N/A',
        location: order.city ? `${order.city}, ${order.zipCode}` : 'N/A',
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: order.createdAt,
      });
    }
    
    const customer = customersMap.get(key);
    customer.totalOrders += 1;
    customer.totalSpend += order.total;
  });

  const customers = Array.from(customersMap.values());

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Customer Directory</h1>
        <p className="text-timber-500">Manage your client base and view their purchasing history.</p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white dark:bg-timber-900 p-12 rounded-2xl text-center border border-wood-100 dark:border-timber-800">
          <UserIcon size={48} className="mx-auto text-timber-300 mb-4" />
          <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-2">No customers yet</h3>
          <p className="text-timber-500">Customer profiles will be automatically generated when orders are placed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-wood-100 dark:border-timber-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xl">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-wood-950 dark:text-white text-lg">{customer.name}</h3>
                    <p className="text-sm text-timber-500 flex items-center gap-1">
                      <MapPin size={14} /> {customer.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-timber-500 uppercase tracking-wider font-bold mb-1">Lifetime Value</p>
                  <p className="text-xl font-black text-wood-950 dark:text-white">₹{customer.totalSpend.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-timber-600 dark:text-timber-300">
                    <Phone size={16} className="text-timber-400" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-timber-600 dark:text-timber-300 truncate">
                    <Mail size={16} className="text-timber-400 shrink-0" />
                    {customer.email}
                  </div>
                </div>
                <div className="space-y-3 bg-wood-50 dark:bg-timber-950/50 p-3 rounded-lg border border-wood-100 dark:border-timber-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-timber-500 flex items-center gap-1"><Package size={14} /> Total Orders</span>
                    <span className="font-bold text-wood-900 dark:text-white">{customer.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-timber-500 flex items-center gap-1"><TrendingUp size={14} /> Last Order</span>
                    <span className="font-medium text-wood-900 dark:text-white">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
