import { errorResponse, jsonResponse } from '@/utils/api';
import {
  findPaymentAttemptByIdempotencyKey,
  findPaymentAttemptByOrderId,
  findPaymentAttemptByProviderRef,
  findPaymentAttemptByProviderSessionId,
  createPaymentAttempt,
  updatePaymentAttemptStatus,
  recordPaymentEvent,
  createPaymentTransaction,
  createRefund,
  recordAuditLog,
} from '@/services/paymentService';
import { updateOrderPaymentStatus } from '@/services/orderService';
import { verifyRazorpayWebhookSignature } from '@/services/paymentProviderService';
import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

type RazorpayWebhookEntity = {
  order_id?: string;
  id?: string;
  payment_id?: string;
  amount?: number;
  amount_paid?: number;
  currency?: string;
  status?: string;
  notes?: Record<string, unknown>;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayWebhookEntity };
    refund?: { entity?: RazorpayWebhookEntity };
  };
  created_at?: number | string;
};

export async function paymentWebhookController(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    verifyRazorpayWebhookSignature(signature, rawBody);

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const eventType = payload.event ?? '';
    const eventEntity = payload.payload?.payment?.entity ?? payload.payload?.refund?.entity ?? null;

    if (!eventType || !eventEntity) {
      return errorResponse('Invalid Razorpay webhook payload.', 400);
    }

    const orderId = eventEntity.order_id as string | undefined;
    const paymentId = eventEntity.id as string | undefined;
    const refundId = eventEntity.payment_id ? (eventEntity.id as string) : undefined;
    const eventRef = `${eventType}:${eventEntity.id ?? eventEntity.order_id ?? payload.created_at}`;
    const provider = 'RAZORPAY';

    let paymentAttempt = null;
    if (orderId) {
      paymentAttempt = await findPaymentAttemptByProviderRef(orderId);
    }

    if (!paymentAttempt && paymentId) {
      paymentAttempt = await findPaymentAttemptByProviderSessionId(paymentId);
    }

    const notes = eventEntity.notes;
    const paymentAttemptId = notes && typeof notes === 'object' ? (notes.paymentAttemptId as string | undefined) : undefined;
    if (!paymentAttempt && paymentAttemptId) {
      paymentAttempt = await prisma.paymentAttempt.findUnique({ where: { id: paymentAttemptId } });
    }

    if (!paymentAttempt) {
      const orderNumber = notes && typeof notes === 'object' ? (notes.orderNumber as string | undefined) : undefined;
      if (orderNumber) {
        const order = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true } });
        if (order) {
          paymentAttempt = await findPaymentAttemptByIdempotencyKey(`${provider}:${order.id}`)
            ?? await findPaymentAttemptByOrderId(order.id);
        }
      }
    }

    if (!paymentAttempt) {
      const localOrderId = notes && typeof notes === 'object' ? (notes.orderId as string | undefined) : undefined;
      if (localOrderId) {
        paymentAttempt = await findPaymentAttemptByIdempotencyKey(`${provider}:${localOrderId}`)
          ?? await findPaymentAttemptByOrderId(localOrderId);
      }
    }

    if (!paymentAttempt && orderId) {
      paymentAttempt = await createPaymentAttempt({
        provider,
        providerRef: orderId,
        amount: Number(((eventEntity.amount_paid ?? eventEntity.amount) ?? 0) / 100),
        currency: eventEntity.currency ?? 'INR',
        status: 'PENDING',
        idempotencyKey: `${provider}:${orderId}`,
        metadata: { razorpayPayload: eventEntity },
      });
    }

    if (!paymentAttempt) {
      return errorResponse('Payment attempt could not be resolved.', 404);
    }

    const expectedAmount = Number(paymentAttempt.amount);
    const eventAmount = Number(((eventEntity.amount_paid ?? eventEntity.amount) ?? 0) / 100);
    if (!eventType.startsWith('refund.') && eventAmount > 0 && Math.abs(expectedAmount - eventAmount) > 0.01) {
      await recordAuditLog(
        {
          orderId: paymentAttempt.orderId ?? undefined,
          attemptId: paymentAttempt.id,
          eventType: 'PAYMENT_AMOUNT_MISMATCH',
          eventSource: 'RAZORPAY_WEBHOOK',
          details: { expectedAmount, eventAmount, eventType, providerRef: orderId },
        },
        prisma
      );
      return errorResponse('Payment amount does not match the payment attempt.', 422);
    }

    const existingEvent = await prisma.paymentEvent.findUnique({ where: { eventRef } });
    if (existingEvent) {
      return jsonResponse({ success: true, message: 'Duplicate event ignored.' });
    }

    try {
      await recordPaymentEvent(paymentAttempt.id, eventType, payload, eventRef);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return jsonResponse({ success: true, message: 'Duplicate event ignored.' });
      }
      throw error;
    }

    if (eventType === 'payment.captured') {
      await updatePaymentAttemptStatus(paymentAttempt.id, PaymentStatus.PAID);
      await createPaymentTransaction(
        {
          orderId: paymentAttempt.orderId ?? undefined,
          attemptId: paymentAttempt.id,
          provider,
          providerTransactionId: paymentId,
          type: 'CHARGE',
          amount: Number(((eventEntity.amount ?? 0) ?? 0) / 100),
          currency: eventEntity.currency ?? 'INR',
          status: 'CAPTURED',
          metadata: { razorpay: eventEntity },
        },
        prisma
      );
      if (paymentAttempt.orderId) {
        await updateOrderPaymentStatus(paymentAttempt.orderId, PaymentStatus.PAID, `Razorpay payment captured (${paymentId}).`);
      }
    }

    if (eventType === 'payment.failed') {
      await updatePaymentAttemptStatus(paymentAttempt.id, PaymentStatus.FAILED);
      if (paymentAttempt.orderId) {
        await updateOrderPaymentStatus(paymentAttempt.orderId, PaymentStatus.FAILED, `Razorpay payment failed (${paymentId}).`);
      }
    }

    if (eventType.startsWith('refund.')) {
      const refundStatus = eventEntity.status?.toUpperCase() ?? 'PENDING';
      const refund = await createRefund(
        {
          orderId: paymentAttempt.orderId ?? undefined,
          attemptId: paymentAttempt.id,
          provider,
          providerRef: refundId,
          amount: Number(((eventEntity.amount ?? 0) ?? 0) / 100),
          currency: eventEntity.currency ?? 'INR',
          status: refundStatus,
          reason: eventEntity.notes?.reason as string | undefined,
          metadata: { razorpay: eventEntity },
        },
        prisma
      );
      await createPaymentTransaction(
        {
          orderId: paymentAttempt.orderId ?? undefined,
          attemptId: paymentAttempt.id,
          provider,
          providerTransactionId: refund.id,
          type: 'REFUND',
          amount: Number(((eventEntity.amount ?? 0) ?? 0) / 100),
          currency: eventEntity.currency ?? 'INR',
          status: refundStatus,
          metadata: { razorpay: eventEntity },
        },
        prisma
      );
      if (paymentAttempt.orderId && refundStatus === 'PROCESSED') {
        await updateOrderPaymentStatus(paymentAttempt.orderId, PaymentStatus.REFUNDED, `Razorpay refund processed (${refundId}).`);
      }
    }

    await recordAuditLog(
      {
        orderId: paymentAttempt.orderId ?? undefined,
        attemptId: paymentAttempt.id,
        eventType,
        eventSource: 'RAZORPAY_WEBHOOK',
        details: { eventType, provider, payload },
      },
      prisma
    );

    return jsonResponse({ success: true });
  } catch (error) {
    logger.warn('Payment webhook processing failed.', { error });
    return errorResponse(error instanceof Error ? error.message : 'Payment webhook processing failed.', 400);
  }
}
