import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface ForecastResult {
  productId: string;
  sku: string;
  name: string;
  currentStock: number;
  weeklyBurnRate: number;
  estimatedDepletionDays: number;
  restockRecommendation: number;
  alertLevel: 'NORMAL' | 'WARN' | 'CRITICAL';
}

export async function getInventoryStockForecasts(limit = 10): Promise<ForecastResult[]> {
  logger.info('[ForecastingService] Generating inventory depletion and demand forecasts');

  try {
    // 1. Fetch active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
      },
      select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true },
      take: limit,
    });

    const forecasts: ForecastResult[] = [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const prod of products) {
      // 2. Query historical deductions (ORDER_CREATION / manual adjustments negative) in the last 30 days
      const txs = await prisma.inventoryTransaction.findMany({
        where: {
          productId: prod.id,
          createdAt: { gte: thirtyDaysAgo },
          quantityChange: { lt: 0 },
        },
        select: { quantityChange: true },
      });

      // Sum negative changes (deducted stock)
      const totalDeducted = txs.reduce((sum, tx) => sum + Math.abs(tx.quantityChange), 0);
      
      // Calculate average burn rate per week (30 days = ~4.28 weeks)
      const weeklyBurnRate = Math.round((totalDeducted / 4.28) * 10) / 10;

      // Estimate days remaining
      let estimatedDepletionDays = 999; // Represents long-term stability
      if (weeklyBurnRate > 0) {
        // days remaining = (current stock / weekly burn rate) * 7
        estimatedDepletionDays = Math.round((prod.stock / weeklyBurnRate) * 7);
      }

      // Restock volume recommendation (forecast 4 weeks ahead + threshold cushion)
      const threshold = prod.lowStockThreshold || 10;
      const targetCushion = threshold * 2;
      const forecastDemand = Math.round(weeklyBurnRate * 4);
      const restockRecommendation = Math.max(0, (forecastDemand + targetCushion) - prod.stock);

      // Determine Alert Level
      let alertLevel: 'NORMAL' | 'WARN' | 'CRITICAL' = 'NORMAL';
      if (prod.stock <= threshold || estimatedDepletionDays <= 7) {
        alertLevel = 'CRITICAL';
      } else if (prod.stock <= threshold * 2 || estimatedDepletionDays <= 14) {
        alertLevel = 'WARN';
      }

      forecasts.push({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        currentStock: prod.stock,
        weeklyBurnRate,
        estimatedDepletionDays,
        restockRecommendation,
        alertLevel,
      });
    }

    return forecasts;
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to calculate demand forecasts, returning default predictions', { error: error.message });
    return [];
  }
}
