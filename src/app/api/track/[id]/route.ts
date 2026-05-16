import { trackController } from '@/controllers/api/trackController';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return trackController(id);
}
