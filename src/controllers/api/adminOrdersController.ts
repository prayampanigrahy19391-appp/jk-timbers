import { orderStatusUpdateSchema } from '@/schemas/apiSchema';
import { errorResponse, jsonResponse, parseJsonBody } from '@/utils/api';
import { updateOrderStatusById } from '@/services/orderService';
import { auth } from '@/../auth';
import { isAdmin } from '@/lib/permissions';

export async function adminOrdersController(request: Request, orderId: string) {
  const session = await auth();
  
  // Note: Middleware already protects this route, but we double-check here
  if (!session?.user || !isAdmin(session.user.role)) {
    return errorResponse('Unauthorized.', 401);
  }

  const parsedBody = await parseJsonBody(request, orderStatusUpdateSchema);
  if (!parsedBody.success) {
    return errorResponse('Invalid status update payload.', 400);
  }

  try {
    const order = await updateOrderStatusById(orderId, parsedBody.data.status);
    return jsonResponse({ success: true, data: order }, 200);
  } catch (error) {
    console.error('Admin Orders Controller Error:', error);
    return errorResponse('Failed to update order status.', 500);
  }
}
