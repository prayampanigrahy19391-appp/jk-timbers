import { NextRequest, NextResponse } from 'next/server';
import { ApiAuthError, requireStaffSession } from '@/lib/apiAuth';
import { listContractorApplications } from '@/services/contractorService';
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

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession();
    const statusParam = request.nextUrl.searchParams.get('status') as ApplicationStatus | null;
    const status = statusParam && Object.values(ApplicationStatus).includes(statusParam) ? statusParam : undefined;
    const applications = await listContractorApplications(status);
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    return handleRouteError(error);
  }
}
