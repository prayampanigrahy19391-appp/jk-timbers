import { contractorController } from '@/controllers/api/contractorController';

export async function POST(request: Request) {
  return contractorController(request);
}
