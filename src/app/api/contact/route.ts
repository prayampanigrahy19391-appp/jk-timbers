import { contactController } from '@/controllers/api/contactController';

export async function POST(request: Request) {
  return contactController(request);
}
