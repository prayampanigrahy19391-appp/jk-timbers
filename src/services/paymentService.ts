import { prisma } from '@/lib/prisma';
import { Prisma, type PaymentProvider, type PaymentStatus } from '@prisma/client';

export async function findPaymentAttemptByIdempotencyKey(key: string) {
  return prisma.paymentAttempt.findFirst({ where: { idempotencyKey: key } });
}

export async function findPaymentAttemptByProviderRef(providerRef: string) {
  return prisma.paymentAttempt.findFirst({ where: { providerRef } });
}

export async function findPaymentAttemptByProviderSessionId(providerSessionId: string) {
  return prisma.paymentAttempt.findFirst({ where: { providerSessionId } });
}

export async function findPaymentAttemptByOrderId(orderId: string) {
  return prisma.paymentAttempt.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findPaymentAttemptById(attemptId: string) {
  return prisma.paymentAttempt.findUnique({ where: { id: attemptId } });
}

export async function createPaymentAttempt(
  data: {
    orderId?: string;
    provider: PaymentProvider;
    providerRef?: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
    idempotencyKey?: string;
    providerSessionId?: string;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  if (data.idempotencyKey) {
    const existing = await tx.paymentAttempt.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
    if (existing) return existing;
  }

  try {
    return await tx.paymentAttempt.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        providerRef: data.providerRef,
        amount: data.amount,
        currency: data.currency ?? 'INR',
        status: data.status ?? 'PENDING',
        idempotencyKey: data.idempotencyKey,
        providerSessionId: data.providerSessionId,
        expiresAt: data.expiresAt,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    if (
      data.idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return tx.paymentAttempt.findUniqueOrThrow({ where: { idempotencyKey: data.idempotencyKey } });
    }
    throw error;
  }
}

export async function updatePaymentAttemptStatus(attemptId: string, status: PaymentStatus) {
  return prisma.paymentAttempt.update({ where: { id: attemptId }, data: { status } });
}

export async function updatePaymentAttemptProviderReference(
  attemptId: string,
  data: {
    providerRef?: string;
    providerSessionId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return prisma.paymentAttempt.update({
    where: { id: attemptId },
    data: {
      providerRef: data.providerRef,
      providerSessionId: data.providerSessionId,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function recordPaymentEvent(
  attemptId: string | null,
  eventType: string,
  payload?: Record<string, unknown>,
  eventRef?: string
) {
  const data: Prisma.PaymentEventCreateInput = {
    attempt: attemptId ? { connect: { id: attemptId } } : undefined,
    eventType,
    eventRef,
    payload: payload as Prisma.InputJsonValue | undefined,
  };

  return prisma.paymentEvent.create({ data });
}

export async function createPaymentTransaction(
  data: {
    orderId?: string;
    attemptId?: string;
    provider: PaymentProvider;
    providerTransactionId?: string;
    type: 'CHARGE' | 'REFUND';
    amount: number;
    currency?: string;
    status: string;
    metadata?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  return tx.paymentTransaction.create({
    data: {
      order: data.orderId ? { connect: { id: data.orderId } } : undefined,
      attempt: data.attemptId ? { connect: { id: data.attemptId } } : undefined,
      provider: data.provider,
      providerTransactionId: data.providerTransactionId,
      type: data.type,
      amount: data.amount,
      currency: data.currency ?? 'INR',
      status: data.status,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function createInvoice(
  data: {
    orderId: string;
    invoiceNumber: string;
    subtotal: number;
    taxTotal: number;
    deliveryFee: number;
    discountTotal: number;
    total: number;
    currency?: string;
    status: string;
    metadata?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  return tx.invoice.create({
    data: {
      order: { connect: { id: data.orderId } },
      invoiceNumber: data.invoiceNumber,
      subtotal: data.subtotal,
      taxTotal: data.taxTotal,
      deliveryFee: data.deliveryFee,
      discountTotal: data.discountTotal,
      total: data.total,
      currency: data.currency ?? 'INR',
      status: data.status,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function findInvoiceByOrderId(orderId: string) {
  return prisma.invoice.findUnique({ where: { orderId } });
}

export async function createRefund(
  data: {
    orderId?: string;
    attemptId?: string;
    provider: PaymentProvider;
    providerRef?: string;
    amount: number;
    currency?: string;
    status: string;
    reason?: string;
    initiatedBy?: string;
    processedAt?: Date;
    metadata?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  return tx.refund.create({
    data: {
      order: data.orderId ? { connect: { id: data.orderId } } : undefined,
      attempt: data.attemptId ? { connect: { id: data.attemptId } } : undefined,
      provider: data.provider,
      providerRef: data.providerRef,
      amount: data.amount,
      currency: data.currency ?? 'INR',
      status: data.status,
      reason: data.reason,
      initiatedBy: data.initiatedBy,
      processedAt: data.processedAt,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function updateRefundStatus(refundId: string, status: string, processedAt?: Date) {
  return prisma.refund.update({ where: { id: refundId }, data: { status, processedAt } });
}

export async function recordAuditLog(
  data: {
    orderId?: string;
    attemptId?: string;
    refundId?: string;
    eventType: string;
    eventSource: string;
    details?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  return tx.paymentAuditLog.create({
    data: {
      order: data.orderId ? { connect: { id: data.orderId } } : undefined,
      attempt: data.attemptId ? { connect: { id: data.attemptId } } : undefined,
      refund: data.refundId ? { connect: { id: data.refundId } } : undefined,
      eventType: data.eventType,
      eventSource: data.eventSource,
      details: data.details as Prisma.InputJsonValue | undefined,
    },
  });
}
