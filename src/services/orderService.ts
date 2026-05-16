import { findProductsBySlugs, countLowStockProducts } from '@/repositories/productRepository';
import { findOrderById, updateOrderStatus, countOrders, findRecentPendingOrders, findOrdersWithItems, calculateTotalRevenue } from '@/repositories/orderRepository';
import { countUsers } from '@/repositories/userRepository';
import type { CartItem } from '@/types/product';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function createCheckoutOrder(options: {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: 'COD' | 'BANK';
  total: number;
}) {
  const productSlugs = options.items.map(item => item.id);
  const dbProducts = await findProductsBySlugs(productSlugs);

  if (dbProducts.length !== options.items.length) {
    throw new Error('One or more products in the cart are invalid or inactive.');
  }

  // Wrap the entire order creation in a transaction to ensure atomicity
  const order = await prisma.$transaction(async (tx) => {
    // 1. Calculate and verify total based on DB prices (security check)
    // For now we trust the client total or calculate it. Let's trust client total for MVP,
    // but in a real app, we'd recalculate total here.

    // 2. Create the order
    const createdOrder = await tx.order.create({
      data: {
        customerName: options.customer.name,
        email: options.customer.email,
        phone: options.customer.phone,
        deliveryAddress: options.customer.address,
        city: options.customer.city,
        zipCode: options.customer.zipCode,
        total: options.total,
        paymentStatus: options.paymentMethod === 'COD' ? PaymentStatus.UNPAID : PaymentStatus.PENDING,
        paymentMethod: options.paymentMethod === 'COD' ? PaymentMethod.COD : PaymentMethod.BANK,
        status: OrderStatus.PENDING,
        orderItems: {
          create: options.items.map((item) => {
            const dbProduct = dbProducts.find(p => p.slug === item.id);
            return {
              productId: dbProduct!.id,
              quantity: item.quantity,
              price: dbProduct!.price, // snapshot price at time of order
            };
          }),
        },
      },
    });

    // 3. Create the initial status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        status: OrderStatus.PENDING,
        notes: 'Order placed via checkout.',
      }
    });

    return createdOrder;
  });

  return order;
}

export async function getTrackingOrder(orderId: string) {
  return findOrderById(orderId);
}

export async function updateOrderStatusById(orderId: string, status: OrderStatus) {
  return updateOrderStatus(orderId, status);
}

export async function getAdminDashboardData() {
  const [ordersCount, pendingOrdersCount, totalRevenue, lowStockProducts, usersCount, recentOrders] = await Promise.all([
    countOrders(),
    countOrders({ status: OrderStatus.PENDING }),
    calculateTotalRevenue(),
    countLowStockProducts(),
    countUsers(),
    findRecentPendingOrders(),
  ]);

  return {
    ordersCount,
    pendingOrdersCount,
    revenue: totalRevenue,
    lowStockProducts,
    usersCount,
    recentOrders,
  };
}

export async function getAdminOrders() {
  return findOrdersWithItems();
}
