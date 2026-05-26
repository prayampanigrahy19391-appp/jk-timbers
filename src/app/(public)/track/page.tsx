'use client';

import { useState, useEffect, memo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, PackageSearch, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: string | number;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  customerName: string;
  deliveryAddress: string;
  city: string;
  zipCode: string;
  orderItems: OrderItem[];
};

// --- Helper Functions ---
const getStatusWidth = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '15%';
    case 'CONFIRMED':
    case 'PROCESSING':
    case 'PACKED':
      return '35%';
    case 'SHIPPED':
      return '65%';
    case 'DELIVERED':
    case 'COMPLETED':
      return '100%';
    default:
      return '0%';
  }
};

const getStatusText = (status: string) => {
  if (status === 'PENDING') {
    return 'Your order is placed and is currently being processed at our warehouse.';
  }
  if (['CONFIRMED', 'PROCESSING', 'PACKED'].includes(status)) {
    return 'Your order is confirmed and moving through warehouse preparation.';
  }
  if (status === 'SHIPPED') {
    return 'Your timber is on the truck. Our driver will contact you prior to arrival.';
  }
  if (['DELIVERED', 'COMPLETED'].includes(status)) {
    return 'This order has been successfully delivered. Thank you for choosing JK Timbers!';
  }
  if (status === 'CANCELLED') {
    return 'This order has been cancelled.';
  }
  if (status === 'REFUNDED') {
    return 'This order has been refunded.';
  }
  return `Status: ${status}`;
};

const renderTimeline = (order: OrderDetail) => {
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="p-6 bg-wood-50/50 dark:bg-timber-950/40 border-t border-wood-100 dark:border-timber-800">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle size={20} />
          <p className="font-semibold">{getStatusText(order.status)}</p>
        </div>
      ) : (
        <div>
          <h4 className="font-bold text-wood-950 dark:text-white mb-6 text-sm uppercase tracking-wider">Tracking Status</h4>
          
          {/* Status Timeline */}
          <div className="relative py-8">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-wood-200 dark:bg-timber-850 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Progress Line */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
              style={{ width: getStatusWidth(order.status) }}
            />

            <div className="relative z-10 flex justify-between items-center px-2 sm:px-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status) 
                    ? 'bg-accent border-yellow-200 dark:border-yellow-900/30 text-wood-950' 
                    : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                }`}>
                  <Clock size={20} />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Processing</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status) 
                    ? 'bg-accent border-yellow-200 dark:border-yellow-900/30 text-wood-950' 
                    : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                }`}>
                  <Truck size={20} />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Dispatched</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  ['DELIVERED', 'COMPLETED'].includes(order.status) 
                    ? 'bg-green-500 border-green-200 dark:border-green-900/30 text-white' 
                    : 'bg-wood-100 dark:bg-timber-900 border-white dark:border-timber-950 text-timber-400'
                }`}>
                  <CheckCircle2 size={20} />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-bold text-wood-950 dark:text-white text-center">Delivered</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-timber-600 dark:text-timber-300 text-center font-medium">
            {getStatusText(order.status)}
          </p>
        </div>
      )}

      {/* Order Items Info */}
      <div className="mt-8 border-t border-wood-100 dark:border-timber-800 pt-6">
        <h4 className="font-bold text-wood-950 dark:text-white mb-4 text-sm uppercase tracking-wider">Items in Order</h4>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm py-2">
              <span className="text-wood-700 dark:text-timber-200">{item.quantity}x {item.name}</span>
              <span className="font-semibold text-wood-950 dark:text-white">₹{Number(item.price).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="border-t border-wood-100 dark:border-timber-800 pt-3 flex justify-between items-center font-bold text-wood-950 dark:text-white">
            <span>Total Price</span>
            <span className="text-accent text-lg">₹{Number(order.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="mt-6 border-t border-wood-100 dark:border-timber-800 pt-6 text-sm">
        <h4 className="font-bold text-wood-950 dark:text-white mb-2 text-sm uppercase tracking-wider">Delivery Address</h4>
        <p className="text-wood-700 dark:text-timber-300">{order.deliveryAddress}, {order.city} - {order.zipCode}</p>
      </div>
    </div>
  );
};

// --- Memoized Sub-component for Order History Rows ---
const OrderTrackRow = memo(function OrderTrackRow({
  order,
  isExpanded,
  onToggle,
}: {
  order: OrderDetail;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Order Summary Line */}
      <button 
        onClick={onToggle}
        className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-wood-50/30 dark:hover:bg-timber-950/20"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-wood-950 dark:text-white text-lg">
              {order.orderNumber}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-timber-500 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          <div className="text-right">
            <p className="text-xs text-timber-500 font-bold uppercase tracking-wider">Total Value</p>
            <p className="text-lg font-black text-accent">₹{Number(order.total).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 bg-wood-50 dark:bg-timber-800 text-timber-600 dark:text-timber-300 rounded-xl">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Timeline Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {renderTimeline(order)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Set display name for react-memo compatibility
OrderTrackRow.displayName = 'OrderTrackRow';

// --- Main Tracking Component ---
export default function TrackOrderPage() {
  const { data: session, status: authStatus } = useSession();
  
  // Authenticated orders tracking
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Manual tracking (Guest mode)
  const [manualId, setManualId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [manualOrder, setManualOrder] = useState<OrderDetail | null>(null);
  
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');

  // Fetch orders if logged in
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const res = await fetch('/api/user/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          if (data.orders && data.orders.length > 0) {
            // Expand first order by default
            setExpandedOrderId(data.orders[0].id);
          }
        } else {
          setOrdersError('Failed to retrieve your orders.');
        }
      } catch (err) {
        setOrdersError('Error connecting to the server.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [authStatus]);

  // Guest order manual search
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    setSearchLoading(true);
    setError('');
    setManualOrder(null);

    try {
      const res = await fetch(`/api/track/${manualId.trim()}`);
      if (!res.ok) {
        throw new Error('Order not found. Please verify your Order ID.');
      }
      const data = await res.json();
      setManualOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search.');
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-wood-50 dark:bg-timber-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <PackageSearch className="mx-auto text-accent mb-4 animate-bounce" size={56} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-4">Track Orders</h1>
          <p className="text-lg text-timber-600 dark:text-timber-400">Flipkart-style order tracking and delivery status dashboard.</p>
        </div>

        {/* Authenticated Dashboard */}
        {authStatus === 'authenticated' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-wood-950 dark:text-white flex items-center gap-2 mb-4">
              <ShoppingBag size={24} className="text-accent" /> Your Order History
            </h2>

            {loadingOrders ? (
              <div className="flex justify-center items-center py-12 bg-white dark:bg-timber-900 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-md">
                <Clock className="animate-spin text-accent" size={32} />
              </div>
            ) : ordersError ? (
              <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-timber-900 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-md">
                <p className="text-timber-600 dark:text-timber-400 text-lg mb-6">You haven&apos;t placed any orders yet.</p>
                <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-yellow-500 text-wood-950 rounded-xl font-bold transition-all shadow-md">
                  Browse Catalog <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderTrackRow
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrderId === order.id}
                    onToggle={() => toggleExpand(order.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Guest/Unauthenticated Form */
          <div className="space-y-8">
            <div className="bg-[#dba24a]/10 border border-[#dba24a]/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-wood-950 dark:text-white text-lg">Already have an account?</h3>
                <p className="text-timber-600 dark:text-timber-400 text-sm">Sign in to instantly track all your order statuses without manual entry.</p>
              </div>
              <Link href="/login?callbackUrl=/track" className="bg-wood-950 text-white font-bold px-6 py-3 rounded-xl hover:bg-wood-800 transition-colors text-center text-sm shadow-md">
                Sign In to Account
              </Link>
            </div>

            <div className="bg-white dark:bg-timber-900 rounded-3xl shadow-xl border border-wood-100 dark:border-timber-800 overflow-hidden">
              <div className="p-8 border-b border-wood-100 dark:border-timber-800">
                <h3 className="font-serif text-2xl font-bold text-wood-950 dark:text-white mb-4 text-center">Track Guest Order</h3>
                <form onSubmit={handleManualSearch} className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-timber-400" size={20} />
                    <input 
                      type="text" 
                      required
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="Enter Order ID or Order Number (e.g. JK-2026...)" 
                      className="w-full bg-wood-50 dark:bg-timber-950 border border-wood-200 dark:border-timber-700 rounded-2xl py-4 pl-12 pr-32 text-wood-950 dark:text-white font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <button 
                      type="submit" 
                      disabled={searchLoading}
                      className="absolute right-2 bg-wood-950 dark:bg-wood-800 hover:bg-wood-800 dark:hover:bg-wood-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl transition-colors"
                    >
                      {searchLoading ? 'Searching...' : 'Track'}
                    </button>
                  </div>
                  {error && <p className="mt-3 text-red-500 text-sm text-center font-medium">{error}</p>}
                </form>
              </div>

              {/* Guest Search Result Timeline */}
              {manualOrder && (
                <div className="bg-wood-50/50 dark:bg-timber-950/50">
                  {renderTimeline(manualOrder)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Manual Tracker at Bottom for Authenticated Users (in case they have other guest order IDs) */}
        {authStatus === 'authenticated' && (
          <div className="mt-12 bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 p-8 shadow-sm">
            <h3 className="font-bold text-wood-950 dark:text-white text-lg mb-4">Track another Order manually</h3>
            <form onSubmit={handleManualSearch} className="relative flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-timber-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter specific Order ID / Number..." 
                  className="w-full bg-wood-50 dark:bg-timber-950 border border-wood-200 dark:border-timber-700 rounded-xl py-3 pl-10 pr-4 text-wood-950 dark:text-white text-sm"
                />
              </div>
              <button 
                type="submit" 
                disabled={searchLoading}
                className="bg-wood-950 hover:bg-wood-800 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                {searchLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
            
            {error && <p className="mt-3 text-red-500 text-sm font-medium">{error}</p>}
            
            {manualOrder && (
              <div className="mt-6 border border-wood-200 dark:border-timber-800 rounded-2xl overflow-hidden bg-wood-50/30">
                <div className="p-4 bg-wood-50 dark:bg-timber-950/50 flex justify-between items-center border-b border-wood-150">
                  <span className="font-bold text-wood-950 dark:text-white">{manualOrder.orderNumber}</span>
                  <span className="text-sm font-bold text-accent">₹{Number(manualOrder.total).toLocaleString('en-IN')}</span>
                </div>
                {renderTimeline(manualOrder)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
