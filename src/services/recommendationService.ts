import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { logger } from '@/lib/logger';

export interface RecommendationContext {
  userId?: string;
  userRole?: Role;
  viewedProductIds?: string[];
  limit?: number;
}

export async function getPersonalizedRecommendations(context: RecommendationContext) {
  const limit = context.limit || 4;
  const role = context.userRole || Role.USER;

  logger.info('[RecommendationEngine] Generating personalized recommendation list', {
    userId: context.userId,
    userRole: role,
    viewedCount: context.viewedProductIds?.length || 0,
  });

  try {
    // Strategy 1: B2B Contractor recommendations
    if (role === Role.CONTRACTOR) {
      // B2B contractors typically purchase industrial bulk timber/plywood
      const bulkProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { category: { slug: { in: ['timber', 'plywood', 'engineered'] } } },
            { thickness: { not: null } },
            { durabilityScore: { gte: 8 } },
          ],
        },
        take: limit,
        orderBy: [
          { durabilityScore: 'desc' },
          { stock: 'desc' },
        ],
      });

      if (bulkProducts.length > 0) return bulkProducts;
    }

    // Strategy 2: Cross-sell based on viewed products
    if (context.viewedProductIds && context.viewedProductIds.length > 0) {
      const lastViewedId = context.viewedProductIds[context.viewedProductIds.length - 1];
      
      const lastViewed = await prisma.product.findUnique({
        where: { id: lastViewedId },
        select: { categoryId: true, basePrice: true },
      });

      if (lastViewed) {
        // Find products in same category with similar price margins
        const similarProducts = await prisma.product.findMany({
          where: {
            isActive: true,
            status: 'PUBLISHED',
            id: { not: lastViewedId },
            categoryId: lastViewed.categoryId,
            basePrice: {
              gte: lastViewed.basePrice.mul(0.7),
              lte: lastViewed.basePrice.mul(1.3),
            },
          },
          take: limit,
          orderBy: { stock: 'desc' },
        });

        if (similarProducts.length > 0) return similarProducts;
      }
    }

    // Strategy 3: Default Popular / Featured items fallback
    return await prisma.product.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
      },
      take: limit,
      orderBy: [
        { durabilityScore: 'desc' },
        { publishedAt: 'desc' },
      ],
    });
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to generate product recommendations, falling back to default lists', { error: error.message });
    
    // Safety Fallback query
    return await prisma.product.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
      },
      take: limit,
    });
  }
}
