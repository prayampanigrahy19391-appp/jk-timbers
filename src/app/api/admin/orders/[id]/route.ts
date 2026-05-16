import { adminOrdersController } from '@/controllers/api/adminOrdersController';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminOrdersController(request, id);
}
