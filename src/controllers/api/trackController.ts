import { trackParamsSchema } from '@/schemas/apiSchema';
import { errorResponse, jsonResponse } from '@/utils/api';
import { getTrackingOrder } from '@/services/orderService';

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
    console.error('Track Controller Error:', error);
    return errorResponse('Internal server error.', 500);
  }
}
