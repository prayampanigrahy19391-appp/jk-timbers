import { NextRequest, NextResponse } from 'next/server';
import { adminProductWriteSchema } from '@/schemas/apiSchema';
import { ApiAuthError, requireAdminSession, requireStaffSession } from '@/lib/apiAuth';
import { archiveAdminProduct, updateAdminProduct } from '@/services/productService';
import { prisma } from '@/lib/prisma';

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaffSession();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        productTags: { include: { tag: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = adminProductWriteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await updateAdminProduct(id, parsed.data);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const product = await archiveAdminProduct(id);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleRouteError(error);
  }
}
