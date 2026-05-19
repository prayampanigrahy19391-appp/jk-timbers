import { NextRequest, NextResponse } from 'next/server';
import { inventoryAdjustmentSchema } from '@/schemas/apiSchema';
import { ApiAuthError, requireStaffSession } from '@/lib/apiAuth';
import {
  applyManualInventoryAdjustment,
  getInventoryHistory,
  getLowStockInventory,
} from '@/services/inventoryService';
import { InventoryTransactionSource } from '@prisma/client';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : 'Inventory operation failed.' },
    { status: 500 }
  );
}

export async function GET() {
  try {
    await requireStaffSession();
    const [lowStock, history] = await Promise.all([getLowStockInventory(), getInventoryHistory()]);
    return NextResponse.json({ success: true, data: { lowStock, history } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const body = await request.json();
    const parsed = inventoryAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    await applyManualInventoryAdjustment({
      ...parsed.data,
      actorId: session.user.id,
      source: InventoryTransactionSource.MANUAL_ADJUSTMENT,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
