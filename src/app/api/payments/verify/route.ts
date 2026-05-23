import { paymentVerifyController } from '@/controllers/api/paymentVerifyController';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return paymentVerifyController(request);
}
