import { getAdminOrders } from '@/services/orderService';
import { Mail, Phone, MapPin, ShoppingCart } from 'lucide-react';
import UpdateStatusButton from './UpdateStatusButton';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Order Management</h1>
        <p className="text-timber-500">View and process customer orders.</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-timber-900 p-12 rounded-2xl text-center border border-wood-100 dark:border-timber-800">
            <ShoppingCart size={48} className="mx-auto text-timber-300 mb-4" />
            <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-2">No orders yet</h3>
            <p className="text-timber-500">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-wood-100 dark:border-timber-800 bg-wood-50 dark:bg-timber-950/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-timber-500">{order.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-timber-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-timber-500 uppercase tracking-wider font-bold mb-1">Total Amount</p>
                    <p className="text-xl font-black text-wood-950 dark:text-white">₹{order.total.toNumber().toLocaleString('en-IN')}</p>
                  </div>
                  {/* Status Update Button Simulation */}
                  {order.status === 'PENDING' && (
                     <UpdateStatusButton orderId={order.id} />
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div>
                  <h4 className="font-bold text-wood-950 dark:text-white mb-4 border-b border-wood-100 dark:border-timber-800 pb-2">Customer Details</h4>
                  <p className="font-medium text-wood-900 dark:text-timber-200 text-lg mb-3">{order.customerName || 'Guest User'}</p>
                  <div className="space-y-2 text-sm text-timber-600 dark:text-timber-400">
                    <p className="flex items-center gap-2"><Phone size={16} className="text-accent" /> {order.phone || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Mail size={16} className="text-accent" /> {order.email || 'N/A'}</p>
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress}<br />
                        {order.city}, {order.zipCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-wood-950 dark:text-white mb-4 border-b border-wood-100 dark:border-timber-800 pb-2">Order Items</h4>
                  <ul className="space-y-3">
                    {order.orderItems.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-timber-700 dark:text-timber-300">
                          <span className="font-bold text-wood-900 dark:text-white mr-2">{item.quantity}x</span>
                          {item.product.name}
                        </span>
                        <span className="font-medium text-wood-900 dark:text-white">₹{(item.price.toNumber() * item.quantity).toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-wood-100 dark:border-timber-800 flex justify-between text-sm">
                    <span className="font-medium text-timber-500">Payment Method</span>
                    <span className="font-bold text-wood-900 dark:text-white">{order.paymentStatus === 'UNPAID' ? 'Cash on Delivery' : 'Pre-paid'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

