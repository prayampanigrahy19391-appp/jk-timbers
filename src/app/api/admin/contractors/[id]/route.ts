import { NextRequest, NextResponse } from 'next/server';
import { contractorReviewSchema } from '@/schemas/apiSchema';
import { ApiAuthError, requireAdminSession } from '@/lib/apiAuth';
import { reviewContractorApplication } from '@/services/contractorService';
import { ApplicationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : 'Contractor operation failed.' },
    { status: 500 }
  );
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = contractorReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const application = await reviewContractorApplication(id, {
      ...parsed.data,
      status: parsed.data.status as ApplicationStatus,
      reviewedById: session.user.id,
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    return handleRouteError(error);
  }
}
