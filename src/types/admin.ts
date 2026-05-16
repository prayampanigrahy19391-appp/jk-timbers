/** KPI data for the admin dashboard. */
export interface AdminDashboardData {
  ordersCount: number;
  pendingOrdersCount: number;
  revenue: number;
  lowStockProducts: number;
  usersCount: number;
  recentOrders: {
    id: string;
    customerName: string | null;
    email: string | null;
    phone: string | null;
    deliveryAddress: string | null;
    city: string | null;
    zipCode: string | null;
    status: string;
    total: number;
    createdAt: Date;
  }[];
}

/** Aggregated customer profile built from order data. */
export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: Date;
}
