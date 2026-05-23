import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedRecommendations } from '@/services/recommendationService';
import { auth } from '@/../auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '4');
    const viewedProductIdsParam = url.searchParams.get('viewedProductIds');
    const viewedProductIds = viewedProductIdsParam
      ? viewedProductIdsParam.split(',').filter(Boolean)
      : [];

    const userSession = await auth();
    const userId = userSession?.user?.id;
    const userRole = userSession?.user?.role as Role | undefined;

    const recommendations = await getPersonalizedRecommendations({
      userId,
      userRole,
      viewedProductIds,
      limit,
    });

    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
