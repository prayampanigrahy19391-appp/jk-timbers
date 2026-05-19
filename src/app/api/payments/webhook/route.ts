import { paymentWebhookController } from '@/controllers/api/paymentWebhookController';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return paymentWebhookController(request);
}
