import { orderStatusUpdateSchema } from '@/schemas/apiSchema';
import { errorResponse, jsonResponse, parseJsonBody } from '@/utils/api';
import { updateOrderStatusById } from '@/services/orderService';
import { auth } from '@/../auth';
import { isAdmin } from '@/lib/permissions';
import { OrderStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function adminOrdersController(request: Request, orderId: string) {
  const session = await auth();
  
  // Note: Middleware already protects this route, but we double-check here
  if (!session?.user) {
    return errorResponse('Unauthorized.', 401);
  }

  if (!isAdmin(session.user.role)) {
    return errorResponse('Forbidden.', 403);
  }

  const parsedBody = await parseJsonBody(request, orderStatusUpdateSchema);
  if (!parsedBody.success) {
    return errorResponse('Invalid status update payload.', 400);
  }

  try {
    const order = await updateOrderStatusById(orderId, parsedBody.data.status as OrderStatus, {
      actorId: session.user.id,
      notes: parsedBody.data.notes,
    });
    return jsonResponse({ success: true, data: order }, 200);
  } catch (error) {
    logger.error('Admin order update failed.', { error, orderId });
    return errorResponse(error instanceof Error ? error.message : 'Failed to update order status.', 409);
  }
}
