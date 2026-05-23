import { errorResponse, jsonResponse } from '@/utils/api';
import { verifyRazorpayPaymentSignature } from '@/services/paymentProviderService';
import { updateOrderPaymentStatus } from '@/services/orderService';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
  orderId: z.string().min(1, 'orderId is required'),
});

export async function paymentVerifyController(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('Invalid JSON payload.', 400);
    }

    const parsed = paymentVerifySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid payment verification data.', 400);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = parsed.data;

    // 1. Verify Razorpay payment signature
    try {
      verifyRazorpayPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    } catch (err) {
      logger.warn('Razorpay signature verification failed.', { error: err instanceof Error ? err.message : err, orderId });
      return errorResponse('Invalid payment signature.', 400);
    }

    // 2. Resolve order and payment attempt
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentAttempts: { orderBy: { createdAt: 'desc' } } },
    });

    if (!order) {
      return errorResponse('Order not found.', 404);
    }

    const paymentAttempt = order.paymentAttempts[0];
    if (paymentAttempt) {
      // Update payment attempt to PAID
      await prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: PaymentStatus.PAID,
          providerRef: razorpay_order_id,
          providerSessionId: razorpay_payment_id,
          metadata: {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          },
        },
      });
    }

    // 3. Mark order as PAID
    await updateOrderPaymentStatus(orderId, PaymentStatus.PAID, `Prepaid Razorpay payment verified (${razorpay_payment_id}).`);

    return jsonResponse({ success: true, message: 'Payment verified and order confirmed.' });
  } catch (error) {
    logger.error('Payment verification failed.', { error });
    return errorResponse(error instanceof Error ? error.message : 'Payment verification failed.', 500);
  }
}
