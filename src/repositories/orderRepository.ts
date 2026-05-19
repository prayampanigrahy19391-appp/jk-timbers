import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

export async function createOrder(orderData: Prisma.OrderCreateInput) {
  return prisma.order.create({ data: orderData });
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, thumbnail: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status },
    });
    
    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        notes,
      },
    });
    
    return updated;
  });
}

export async function countOrders(where: Prisma.OrderWhereInput = {}) {
  return prisma.order.count({ where });
}

export async function calculateTotalRevenue() {
  const result = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: PaymentStatus.PAID },
  });
  return result._sum.total?.toNumber() || 0;
}

export async function findRecentPendingOrders() {
  return prisma.order.findMany({
    where: { status: OrderStatus.PENDING },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

export async function findOrdersWithItems() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: { product: true, variant: true },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
}

/** Fetch all orders to build customer profiles. */
export async function findAllOrdersForCustomerAggregation() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
