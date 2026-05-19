import { trackParamsSchema } from '@/schemas/apiSchema';
import { errorResponse, jsonResponse } from '@/utils/api';
import { getTrackingOrder } from '@/services/orderService';
import { logger } from '@/lib/logger';

export async function trackController(orderId: string) {
  const parsed = trackParamsSchema.safeParse({ id: orderId });

  if (!parsed.success) {
    return errorResponse('Invalid order identifier.', 400);
  }

  try {
    const order = await getTrackingOrder(parsed.data.id);

    if (!order) {
      return errorResponse('Order not found.', 404);
    }

    return jsonResponse({ success: true, data: order }, 200);
  } catch (error) {
    logger.error('Track lookup failed.', { error, orderId: parsed.data.id });
    return errorResponse('Internal server error.', 500);
  }
}
