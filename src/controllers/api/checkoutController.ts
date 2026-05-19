import { checkoutRequestSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { createCheckoutOrder } from '@/services/orderService';
import { createRazorpayOrder, hasRazorpayCredentials, isRazorpayProvider } from '@/services/paymentProviderService';
import { updatePaymentAttemptProviderReference } from '@/services/paymentService';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';

type CheckoutPaymentResponse = {
  provider: string;
  attemptId: string;
  status: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
};

export async function checkoutController(request: Request) {
  const parsed = await parseJsonBody(request, checkoutRequestSchema);

  if (!parsed.success) {
    return errorResponse('Invalid checkout data.', 400);
  }

  const { cartToken, customer, paymentMethod, paymentProvider, paymentIdempotencyKey, total } = parsed.data;

  try {
    if (paymentProvider && isRazorpayProvider(paymentProvider) && !hasRazorpayCredentials()) {
      return errorResponse('Razorpay is not configured for this environment.', 503);
    }

    const session = await auth();
    const order = await createCheckoutOrder({
      cartToken,
      userId: session?.user?.id,
      customer,
      paymentMethod,
      paymentProvider,
      paymentIdempotencyKey,
      total,
    });

    const pendingAttempt = order.paymentAttempts?.[0];
    let payment: CheckoutPaymentResponse | undefined = pendingAttempt
      ? {
          provider: pendingAttempt.provider,
          attemptId: pendingAttempt.id,
          status: pendingAttempt.status,
        }
      : undefined;

    if (pendingAttempt && isRazorpayProvider(pendingAttempt.provider)) {
      const razorpayOrder = await createRazorpayOrder({
        amount: Number(order.total),
        currency: order.currency,
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentAttemptId: pendingAttempt.id,
        },
      });

      await updatePaymentAttemptProviderReference(pendingAttempt.id, {
        providerRef: razorpayOrder.id,
        providerSessionId: razorpayOrder.id,
        metadata: {
          orderNumber: order.orderNumber,
          razorpayOrder,
        },
      });

      payment = {
        provider: pendingAttempt.provider,
        attemptId: pendingAttempt.id,
        status: pendingAttempt.status,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    }

    return jsonResponse({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment,
      },
    }, 201);
  } catch (error) {
    logger.error('Checkout controller failed.', { error });
    return errorResponse(error instanceof Error ? error.message : 'Failed to process order.', 409);
  }
}
