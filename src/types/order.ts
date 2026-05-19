export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PAID'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Lightweight order summary returned by the tracking API. */
export interface OrderSummary {
  id: string;
  orderNumber?: string;
  status: string;
  customerName: string | null;
  createdAt: Date;
  total: number;
}

/** Full order with items for admin views. */
export interface OrderWithItems extends OrderSummary {
  email: string | null;
  phone: string | null;
  deliveryAddress: string | null;
  city: string | null;
  zipCode: string | null;
  paymentStatus: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}
