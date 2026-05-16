import { NextResponse } from 'next/server';
import { ZodTypeAny } from 'zod';

export async function parseJsonBody<T extends ZodTypeAny>(request: Request, schema: T) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return { success: false as const, error: 'Invalid JSON payload.', data: null };
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    return { success: false as const, error: result.error.format(), data: null };
  }

  return { success: true as const, data: result.data };
}

export function jsonResponse<T>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}

export function errorResponse(message: string, status = 500) {
  return jsonResponse({ success: false, error: message }, status);
}
