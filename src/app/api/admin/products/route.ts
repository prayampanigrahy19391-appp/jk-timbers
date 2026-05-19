import { NextRequest, NextResponse } from 'next/server';
import { adminProductWriteSchema } from '@/schemas/apiSchema';
import { ApiAuthError, requireAdminSession, requireStaffSession } from '@/lib/apiAuth';
import { createAdminProduct, getAdminProducts } from '@/services/productService';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : 'Product operation failed.' },
    { status: 500 }
  );
}

export async function GET() {
  try {
    await requireStaffSession();
    const products = await getAdminProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = adminProductWriteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await createAdminProduct(parsed.data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
