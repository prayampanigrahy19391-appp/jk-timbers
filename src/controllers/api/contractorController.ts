import { contractorRequestSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { processContractorApplication } from '@/services/contractorService';

export async function contractorController(request: Request) {
  const parsed = await parseJsonBody(request, contractorRequestSchema);

  if (!parsed.success) {
    return errorResponse('Invalid contractor application.', 400);
  }

  try {
    const result = await processContractorApplication(parsed.data);
    return jsonResponse({ success: true, data: result });
  } catch (error) {
    console.error('Contractor Controller Error:', error);
    return errorResponse('Failed to process application.', 500);
  }
}
