import { checkoutRequestSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { createCheckoutOrder } from '@/services/orderService';

export async function checkoutController(request: Request) {
  const parsed = await parseJsonBody(request, checkoutRequestSchema);

  if (!parsed.success) {
    return errorResponse('Invalid checkout data.', 400);
  }

  const { items, customer, paymentMethod, total } = parsed.data;

  try {
    const order = await createCheckoutOrder({ items, customer, paymentMethod, total });
    return jsonResponse({ success: true, data: { orderId: order.id } }, 201);
  } catch (error) {
    console.error('Checkout Controller Error:', error);
    return errorResponse('Failed to process order.', 500);
  }
}
