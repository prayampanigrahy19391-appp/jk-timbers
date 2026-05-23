import { errorResponse, jsonResponse } from '@/utils/api';
import { handleSupportQuery } from '@/services/supportAssistantService';
import { auth } from '@/../auth';
import { z } from 'zod';

const supportRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string(),
    })
  ).default([]),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('Invalid JSON payload.', 400);
    }

    const parsed = supportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid support request data.', 400);
    }

    const { query, sessionId, history } = parsed.data;

    // Resolve user details if logged in
    const userSession = await auth();

    const supportSession = {
      sessionId,
      userId: userSession?.user?.id,
      history,
    };

    const result = await handleSupportQuery(query, supportSession);

    return jsonResponse({ success: true, data: result });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to handle support query.', 500);
  }
}
