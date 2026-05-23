import { randomUUID } from 'crypto';
import { countLowStockProducts } from '@/repositories/productRepository';
import {
  countOrders,
  findRecentPendingOrders,
  findOrdersWithItems,
  calculateTotalRevenue,
} from '@/repositories/orderRepository';
import { countUsers } from '@/repositories/userRepository';
import {
  InventoryTransactionSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentProvider,
  Prisma,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { deductStock, restoreStock } from '@/services/inventoryService';
import {
  assertExpectedTotal,
  calculateLinePrice,
  calculateOrderTotals,
} from '@/services/pricingService';
import { createInvoice, createPaymentAttempt, recordAuditLog } from '@/services/paymentService';
import {
  assertAllowedOrderTransition,
  restoresInventoryForTransition,
} from '@/services/orderStateMachine';

type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
};

type ResolvedCheckoutLine = {
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  discountTotal: number;
  lineTotal: number;
  snapshot: Record<string, unknown>;
};

function normalizePaymentMethod(paymentMethod: 'COD' | 'BANK' | 'UPI') {
  if (paymentMethod === 'BANK') return PaymentMethod.BANK;
  if (paymentMethod === 'UPI') return PaymentMethod.UPI;
  return PaymentMethod.COD;
}

function initialPaymentStatus(paymentMethod: PaymentMethod) {
  return paymentMethod === PaymentMethod.COD ? PaymentStatus.UNPAID : PaymentStatus.PENDING;
}

async function generateOrderNumber(tx: Prisma.TransactionClient) {
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    const orderNumber = `JK-${datePart}-${suffix}`;
    const existing = await tx.order.findUnique({ where: { orderNumber }, select: { id: true } });
    if (!existing) return orderNumber;
  }

  throw new Error('Unable to allocate a unique order number.');
}

async function generateInvoiceNumber(tx: Prisma.TransactionClient) {
  const today = new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
    const existing = await tx.invoice.findUnique({ where: { invoiceNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }

  throw new Error('Unable to allocate a unique invoice number.');
}

async function resolveContractorDiscount(tx: Prisma.TransactionClient, userId?: string | null) {
  if (!userId) return null;

  const application = await tx.contractorApplication.findUnique({
    where: { userId },
    select: { status: true, discountRate: true },
  });

  return application?.status === 'APPROVED' ? application.discountRate : null;
}

async function resolveCheckoutLines(
  tx: Prisma.TransactionClient,
  cartItems: {
    sku: string;
    quantity: number;
    productId: string | null;
    variantId: string | null;
  }[],
  contractorDiscountRate?: Prisma.Decimal | null
): Promise<ResolvedCheckoutLine[]> {
  const quantityByKey = cartItems.reduce<Record<string, number>>((acc, item) => {
    const key = item.variantId ?? item.productId ?? item.sku.trim();
    acc[key] = (acc[key] ?? 0) + item.quantity;
    return acc;
  }, {});

  const keys = Object.keys(quantityByKey);
  if (keys.length === 0) {
    throw new Error('Cart is empty.');
  }

  const [variants, products] = await Promise.all([
    tx.productVariant.findMany({
      where: {
        OR: [{ id: { in: keys } }, { sku: { in: keys } }],
      },
      include: { product: { include: { category: true } } },
    }),
    tx.product.findMany({
      where: {
        OR: [{ id: { in: keys } }, { slug: { in: keys } }, { sku: { in: keys } }],
      },
      include: { category: true },
    }),
  ]);

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));
  const variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));
  const productById = new Map(products.map((product) => [product.id, product]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const productBySku = new Map(products.map((product) => [product.sku, product]));

  return keys.map((key) => {
    const quantity = quantityByKey[key];
    const variant = variantById.get(key) ?? variantBySku.get(key);
    const product = variant?.product ?? productById.get(key) ?? productBySlug.get(key) ?? productBySku.get(key);

    if (!product || !product.isActive || product.status !== 'PUBLISHED') {
      throw new Error('One or more products in the cart are invalid or inactive.');
    }

    if (variant && !variant.isActive) {
      throw new Error(`Variant ${variant.sku} is no longer available.`);
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock for ${variant ? `${product.name} - ${variant.name}` : product.name}.`);
    }

    const pricing = calculateLinePrice({
      unitPrice: variant?.price ?? product.basePrice,
      quantity,
      contractorDiscountRate,
    });

    const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;

    return {
      productId: product.id,
      variantId: variant?.id,
      sku: variant?.sku ?? product.sku,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      unit: variant?.unit ?? product.unit,
      quantity,
      unitPrice: pricing.unitPrice,
      lineSubtotal: pricing.subtotal,
      discountTotal: pricing.discountTotal,
      lineTotal: pricing.total,
      snapshot: {
        productName: product.name,
        variantName: variant?.name,
        categoryName: product.category.name,
        slug: product.slug,
        image: variant?.image ?? product.thumbnail ?? firstImage,
      },
    };
  });
}

export async function createCheckoutOrder(options: {
  cartToken: string;
  userId?: string;
  customer: CheckoutCustomer;
  paymentMethod: 'COD' | 'BANK' | 'UPI';
  paymentProvider?: PaymentProvider;
  paymentIdempotencyKey?: string;
  total?: number;
}) {
  const order = await prisma.$transaction(
    async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { token: options.cartToken },
        include: { items: true, order: true },
      });

      if (!cart) {
        throw new Error('Cart not found. Please refresh your cart and try again.');
      }

      if (cart.status === 'CHECKED_OUT') {
        const existingOrder = cart.order ?? (await tx.order.findUnique({ where: { cartId: cart.id } }));
        if (existingOrder) {
          return tx.order.findUniqueOrThrow({
            where: { id: existingOrder.id },
            include: { paymentAttempts: true },
          });
        }
        throw new Error('Cart has already been checked out.');
      }

      if (cart.items.length === 0) {
        throw new Error('Cart is empty.');
      }

      const contractorDiscountRate = await resolveContractorDiscount(tx, options.userId ?? cart.userId);
      const orderItems = await resolveCheckoutLines(tx, cart.items, contractorDiscountRate);
      const totals = calculateOrderTotals(
        orderItems.map((item) => ({
          subtotal: item.lineSubtotal,
          discountTotal: item.discountTotal,
          total: item.lineTotal,
        }))
      );

      assertExpectedTotal(options.total, totals.total);

      const paymentMethod = normalizePaymentMethod(options.paymentMethod);
      const order = await tx.order.create({
        data: {
          orderNumber: await generateOrderNumber(tx),
          userId: options.userId ?? cart.userId,
          cartId: cart.id,
          customerName: options.customer.name,
          email: options.customer.email.toLowerCase(),
          phone: options.customer.phone,
          deliveryAddress: options.customer.address,
          city: options.customer.city,
          zipCode: options.customer.zipCode,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          deliveryFee: totals.deliveryFee,
          discountTotal: totals.discountTotal,
          total: totals.total,
          currency: totals.currency,
          paymentStatus: initialPaymentStatus(paymentMethod),
          paymentMethod,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              sku: item.sku,
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              price: item.unitPrice,
              lineTotal: item.lineTotal,
              itemSnapshot: item.snapshot as Prisma.InputJsonValue,
            })),
          },
        },
      });

      for (const item of orderItems) {
        await deductStock(
          tx,
          item.variantId ? { variantId: item.variantId } : { productId: item.productId },
          item.quantity,
          {
            orderId: order.id,
            source: InventoryTransactionSource.ORDER_CREATION,
            reason: `Order reservation for ${item.sku}`,
            metadata: { orderNumber: order.orderNumber, cartId: cart.id },
          }
        );
      }

      if (paymentMethod !== PaymentMethod.COD) {
        const provider: PaymentProvider = options.paymentProvider ?? 'UPI';

        await createPaymentAttempt(
          {
            orderId: order.id,
            provider,
            amount: totals.total,
            currency: totals.currency,
            idempotencyKey: options.paymentIdempotencyKey ?? `${provider}:${order.id}`,
            status: 'PENDING',
            metadata: {
              orderNumber: order.orderNumber,
              cartId: cart.id,
              paymentMethod,
            },
          },
          tx
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
          notes: 'Order placed via validated server cart.',
        },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          status: 'CHECKED_OUT',
          checkedOutAt: new Date(),
          total: totals.total,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { paymentAttempts: true },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  // Trigger background actions outside transaction after successful commit!
  try {
    const { queueEmailNotification } = await import('@/services/jobs/emailJob');
    const { dispatchEcosystemEvent } = await import('@/services/webhookDispatchService');

    await queueEmailNotification({
      to: order.email,
      subject: `Order Placed - ${order.orderNumber}`,
      body: `Hi ${order.customerName},\n\nYour order ${order.orderNumber} for ₹${Number(order.total).toLocaleString('en-IN')} has been placed successfully.\n\nThank you for shopping with JK Timbers!\n\nBest regards,\nJK Timbers Team`,
    }).catch(err => console.error('Failed to queue email notification:', err));

    await dispatchEcosystemEvent('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      customerEmail: order.email,
    }).catch(err => console.error('Failed to dispatch ecosystem event:', err));
  } catch (e) {
    console.error('Failed to trigger post-checkout background events:', e);
  }

  return order;
}

export async function updateOrderPaymentStatus(orderId: string, status: PaymentStatus, notes?: string) {
  let invoiceNumberResolved = '';
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
    if (!order) throw new Error('Order not found.');

    const data: Prisma.OrderUpdateInput = {
      paymentStatus: status,
    };
    let timelineStatus: OrderStatus | undefined;
    let shouldRestoreInventory = false;

    if (status === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      data.status = OrderStatus.CONFIRMED;
      timelineStatus = OrderStatus.CONFIRMED;
    }

    if (status === PaymentStatus.FAILED && order.status === OrderStatus.PENDING) {
      data.status = OrderStatus.CANCELLED;
      timelineStatus = OrderStatus.CANCELLED;
      shouldRestoreInventory = true;
    }

    if (status === PaymentStatus.REFUNDED && order.status !== OrderStatus.REFUNDED) {
      data.status = OrderStatus.REFUNDED;
      timelineStatus = OrderStatus.REFUNDED;
    }

    const updatedOrder = await tx.order.update({ where: { id: orderId }, data });

    if (timelineStatus) {
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: timelineStatus,
          notes: notes ?? `Order updated after payment status changed to ${status}.`,
        },
      });
    }

    if (shouldRestoreInventory) {
      for (const item of order.orderItems) {
        await restoreStock(
          tx,
          item.productId ?? undefined,
          item.variantId ?? undefined,
          item.quantity,
          `Stock restored after payment failure for order ${order.orderNumber}`,
          InventoryTransactionSource.ORDER_CANCELLATION,
          { orderNumber: order.orderNumber },
          order.id
        );
      }
    }

    if (status === PaymentStatus.PAID) {
      const existingInvoice = await tx.invoice.findUnique({ where: { orderId } });
      let invoiceNumber = '';
      if (!existingInvoice) {
        invoiceNumber = await generateInvoiceNumber(tx);
        await createInvoice(
          {
            orderId,
            invoiceNumber,
            subtotal: Number(order.subtotal),
            taxTotal: Number(order.taxTotal),
            deliveryFee: Number(order.deliveryFee),
            discountTotal: Number(order.discountTotal),
            total: Number(order.total),
            currency: order.currency,
            status: 'PAID',
            metadata: {
              paymentStatus: status,
              orderNumber: order.orderNumber,
            },
          },
          tx
        );
      } else {
        invoiceNumber = existingInvoice.invoiceNumber;
      }
      invoiceNumberResolved = invoiceNumber;

      await recordAuditLog(
        {
          orderId,
          eventType: 'ORDER_PAYMENT_CONFIRMED',
          eventSource: 'ORDER_SERVICE',
          details: {
            paymentStatus: status,
            orderNumber: order.orderNumber,
          },
        },
        tx
      );
    }

    return updatedOrder;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  // Post commit background jobs
  try {
    const { queueEmailNotification } = await import('@/services/jobs/emailJob');
    if (status === PaymentStatus.PAID && invoiceNumberResolved) {
      const { queueInvoiceGeneration } = await import('@/services/jobs/invoiceJob');
      await queueInvoiceGeneration({
        orderId,
        invoiceNumber: invoiceNumberResolved,
      }).catch(err => console.error('Failed to queue invoice generation:', err));

      await queueEmailNotification({
        to: updated.email,
        subject: `Payment Confirmed - Order ${updated.orderNumber}`,
        body: `Hi ${updated.customerName},\n\nWe have confirmed your payment of ₹${Number(updated.total).toLocaleString('en-IN')} for order ${updated.orderNumber}.\n\nYour invoice (${invoiceNumberResolved}) is being generated.\n\nThank you,\nJK Timbers Team`,
      }).catch(err => console.error('Failed to queue email notification:', err));
    } else if (status === PaymentStatus.FAILED) {
      await queueEmailNotification({
        to: updated.email,
        subject: `Payment Failed - Order ${updated.orderNumber}`,
        body: `Hi ${updated.customerName},\n\nYour payment attempt for order ${updated.orderNumber} failed. The order has been cancelled and stock has been restored to inventory.\n\nIf you believe this was an error, please try placing the order again.\n\nThank you,\nJK Timbers Team`,
      }).catch(err => console.error('Failed to queue email notification:', err));
    }
  } catch (e) {
    console.error('Failed to trigger post-payment background events:', e);
  }

  return updated;
}

export async function getTrackingOrder(orderIdOrNumber: string) {
  return prisma.order.findFirst({
    where: {
      OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
    },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, name: true, slug: true, thumbnail: true } },
          variant: { select: { id: true, name: true, sku: true } },
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function updateOrderStatusById(
  orderId: string,
  newStatus: OrderStatus,
  options: { actorId?: string; notes?: string } = {}
) {
  const order = await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) throw new Error('Order not found.');

      const currentStatus = order.status;
      if (currentStatus === newStatus) return order;

      assertAllowedOrderTransition(currentStatus, newStatus);

      const updateResult = await tx.order.updateMany({
        where: { id: orderId, status: currentStatus },
        data: {
          status: newStatus,
          ...(newStatus === OrderStatus.REFUNDED ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
        },
      });

      if (updateResult.count !== 1) {
        throw new Error('Order status changed while this update was being processed.');
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus,
          notes: options.notes ?? `Order moved from ${currentStatus} to ${newStatus}.`,
          actorId: options.actorId,
        },
      });

      if (restoresInventoryForTransition(currentStatus, newStatus)) {
        for (const item of order.orderItems) {
          await restoreStock(
            tx,
            item.productId ?? undefined,
            item.variantId ?? undefined,
            item.quantity,
            `Stock restored after order ${newStatus}`,
            InventoryTransactionSource.ORDER_CANCELLATION,
            { orderNumber: order.orderNumber },
            order.id
          );
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          orderItems: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  // Post commit background jobs
  try {
    const { queueEmailNotification } = await import('@/services/jobs/emailJob');
    const { dispatchEcosystemEvent } = await import('@/services/webhookDispatchService');

    await queueEmailNotification({
      to: order.email,
      subject: `Order Status Updated: ${newStatus} - ${order.orderNumber}`,
      body: `Hi ${order.customerName},\n\nYour order ${order.orderNumber} status has been updated to "${newStatus}".\n\nThank you,\nJK Timbers Team`,
    }).catch(err => console.error('Failed to queue email notification:', err));

    if (newStatus === OrderStatus.SHIPPED) {
      await dispatchEcosystemEvent('order.shipped', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: newStatus,
        shippedAt: new Date().toISOString(),
      }).catch(err => console.error('Failed to dispatch ecosystem event:', err));
    }
  } catch (e) {
    console.error('Failed to trigger post-status-update background events:', e);
  }

  return order;
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

export async function getCustomerOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
