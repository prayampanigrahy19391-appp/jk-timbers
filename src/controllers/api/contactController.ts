import { contactRequestSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { processContactRequest } from '@/services/contactService';

export async function contactController(request: Request) {
  const parsed = await parseJsonBody(request, contactRequestSchema);

  if (!parsed.success) {
    return errorResponse('Invalid contact submission.', 400);
  }

  try {
    const result = await processContactRequest(parsed.data);
    return jsonResponse({ success: true, data: result });
  } catch (error) {
    console.error('Contact Controller Error:', error);
    return errorResponse('Failed to process contact request.', 500);
  }
}
