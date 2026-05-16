import { checkoutController } from '@/controllers/api/checkoutController';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return checkoutController(request);
}
