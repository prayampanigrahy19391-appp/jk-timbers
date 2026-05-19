import { contractorRequestSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { processContractorApplication } from '@/services/contractorService';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';

export async function contractorController(request: Request) {
  const parsed = await parseJsonBody(request, contractorRequestSchema);

  if (!parsed.success) {
    return errorResponse('Invalid contractor application.', 400);
  }

  try {
    const session = await auth();
    const result = await processContractorApplication({ ...parsed.data, userId: session?.user?.id });
    return jsonResponse({ success: true, message: 'Application submitted for admin review.', data: result });
  } catch (error) {
    logger.error('Contractor application failed.', { error });
    return errorResponse(error instanceof Error ? error.message : 'Failed to process application.', 409);
  }
}
