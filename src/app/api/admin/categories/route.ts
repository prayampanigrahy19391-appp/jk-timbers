import { NextRequest, NextResponse } from 'next/server';
import { adminCategoryWriteSchema } from '@/schemas/apiSchema';
import { ApiAuthError, requireAdminSession, requireStaffSession } from '@/lib/apiAuth';
import { createAdminCategory, listAdminCategories } from '@/services/productService';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : 'Category operation failed.' },
    { status: 500 }
  );
}

export async function GET() {
  try {
    await requireStaffSession();
    const categories = await listAdminCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = adminCategoryWriteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await createAdminCategory(parsed.data);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
