import { OrderStatus } from '@prisma/client';

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  PACKED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
  COMPLETED: [OrderStatus.REFUNDED],
  CANCELLED: [],
  REFUNDED: [],
};

export function assertAllowedOrderTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
  if (currentStatus === newStatus) return;

  const allowed = ORDER_TRANSITIONS[currentStatus]?.includes(newStatus);
  if (!allowed) {
    throw new Error(`Invalid state transition from ${currentStatus} to ${newStatus}.`);
  }
}

export function restoresInventoryForTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
  const cancellableStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.PACKED,
  ];

  return newStatus === OrderStatus.CANCELLED && cancellableStatuses.includes(currentStatus);
}
