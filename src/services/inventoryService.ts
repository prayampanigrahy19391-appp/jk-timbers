import { prisma } from '@/lib/prisma';
import { InventoryTransactionSource, Prisma } from '@prisma/client';

type StockTarget =
  | { productId: string; variantId?: never }
  | { productId?: string; variantId: string };

type StockMovementOptions = {
  reason: string;
  source?: InventoryTransactionSource;
  orderId?: string;
  warehouseId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

export type InventoryAdjustmentInput = {
  productId?: string;
  variantId?: string;
  quantityChange: number;
  reason: string;
  source?: InventoryTransactionSource;
  warehouseId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

function assertPositiveQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Inventory quantity must be a positive whole number.');
  }
}

function normalizeQuantityChange(quantityChange: number) {
  if (!Number.isInteger(quantityChange) || quantityChange === 0) {
    throw new Error('Inventory adjustment must be a non-zero whole number.');
  }
}

async function applyProductStockChange(
  tx: Prisma.TransactionClient,
  productId: string,
  quantityChange: number,
  options: StockMovementOptions
) {
  normalizeQuantityChange(quantityChange);

  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { stock: true, lowStockThreshold: true, sku: true },
  });

  if (!product) {
    throw new Error('Product not found for inventory update.');
  }

  const stockAfter = product.stock + quantityChange;
  if (stockAfter < 0) {
    throw new Error('Insufficient product stock.');
  }

  const updateResult = await tx.product.updateMany({
    where: {
      id: productId,
      ...(quantityChange < 0 ? { stock: { gte: Math.abs(quantityChange) } } : {}),
    },
    data: { stock: { increment: quantityChange } },
  });

  if (updateResult.count !== 1) {
    throw new Error('Insufficient product stock.');
  }

  await tx.inventoryTransaction.create({
    data: {
      productId,
      orderId: options.orderId,
      warehouseId: options.warehouseId,
      actorId: options.actorId,
      quantityChange,
      stockBefore: product.stock,
      stockAfter,
      source: options.source ?? InventoryTransactionSource.MANUAL_ADJUSTMENT,
      reason: options.reason,
      metadata: options.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  if (quantityChange < 0 && product.lowStockThreshold !== null && stockAfter <= product.lowStockThreshold) {
    try {
      const { dispatchEcosystemEvent } = await import('@/services/webhookDispatchService');
      await dispatchEcosystemEvent('inventory.low', {
        productId,
        sku: product.sku,
        stock: stockAfter,
        lowStockThreshold: product.lowStockThreshold,
      });
    } catch (e) {
      console.error('Failed to dispatch low stock ecosystem event:', e);
    }
  }
}

async function applyVariantStockChange(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantityChange: number,
  options: StockMovementOptions
) {
  normalizeQuantityChange(quantityChange);

  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true, lowStockThreshold: true, sku: true },
  });

  if (!variant) {
    throw new Error('Product variant not found for inventory update.');
  }

  const stockAfter = variant.stock + quantityChange;
  if (stockAfter < 0) {
    throw new Error('Insufficient variant stock.');
  }

  const updateResult = await tx.productVariant.updateMany({
    where: {
      id: variantId,
      ...(quantityChange < 0 ? { stock: { gte: Math.abs(quantityChange) } } : {}),
    },
    data: { stock: { increment: quantityChange } },
  });

  if (updateResult.count !== 1) {
    throw new Error('Insufficient variant stock.');
  }

  await tx.inventoryTransaction.create({
    data: {
      variantId,
      orderId: options.orderId,
      warehouseId: options.warehouseId,
      actorId: options.actorId,
      quantityChange,
      stockBefore: variant.stock,
      stockAfter,
      source: options.source ?? InventoryTransactionSource.MANUAL_ADJUSTMENT,
      reason: options.reason,
      metadata: options.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  if (quantityChange < 0 && variant.lowStockThreshold !== null && stockAfter <= variant.lowStockThreshold) {
    try {
      const { dispatchEcosystemEvent } = await import('@/services/webhookDispatchService');
      await dispatchEcosystemEvent('inventory.low', {
        variantId,
        sku: variant.sku,
        stock: stockAfter,
        lowStockThreshold: variant.lowStockThreshold,
      });
    } catch (e) {
      console.error('Failed to dispatch low stock ecosystem event:', e);
    }
  }
}

export async function deductStock(
  tx: Prisma.TransactionClient,
  target: StockTarget,
  quantity: number,
  options: StockMovementOptions
) {
  assertPositiveQuantity(quantity);

  if ('variantId' in target && target.variantId) {
    return applyVariantStockChange(tx, target.variantId, -quantity, {
      ...options,
      source: options.source ?? InventoryTransactionSource.ORDER_CREATION,
    });
  }

  if ('productId' in target && target.productId) {
    return applyProductStockChange(tx, target.productId, -quantity, {
      ...options,
      source: options.source ?? InventoryTransactionSource.ORDER_CREATION,
    });
  }

  throw new Error('Product or variant id is required for stock deduction.');
}

export async function restoreStock(
  tx: Prisma.TransactionClient,
  productId?: string,
  variantId?: string,
  quantity = 0,
  reason = 'Stock restoration',
  source: InventoryTransactionSource = InventoryTransactionSource.MANUAL_ADJUSTMENT,
  metadata?: Record<string, unknown>,
  orderId?: string
) {
  assertPositiveQuantity(quantity);

  if (variantId) {
    return applyVariantStockChange(tx, variantId, quantity, { reason, source, metadata, orderId });
  }

  if (productId) {
    return applyProductStockChange(tx, productId, quantity, { reason, source, metadata, orderId });
  }

  throw new Error('Product or variant id is required for stock restoration.');
}

export async function adjustProductStock(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  reason: string,
  source: InventoryTransactionSource = InventoryTransactionSource.ORDER_CREATION,
  metadata?: Record<string, unknown>
) {
  return deductStock(tx, { productId }, quantity, { reason, source, metadata });
}

export async function adjustVariantStock(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
  reason: string,
  source: InventoryTransactionSource = InventoryTransactionSource.ORDER_CREATION,
  metadata?: Record<string, unknown>
) {
  return deductStock(tx, { variantId }, quantity, { reason, source, metadata });
}

export async function applyManualInventoryAdjustment(input: InventoryAdjustmentInput) {
  return prisma.$transaction(
    async (tx) => {
      const options: StockMovementOptions = {
        reason: input.reason,
        source: input.source ?? InventoryTransactionSource.MANUAL_ADJUSTMENT,
        warehouseId: input.warehouseId,
        actorId: input.actorId,
        metadata: input.metadata,
      };

      if (input.variantId) {
        await applyVariantStockChange(tx, input.variantId, input.quantityChange, options);
      } else if (input.productId) {
        await applyProductStockChange(tx, input.productId, input.quantityChange, options);
      } else {
        throw new Error('Product or variant id is required for inventory adjustment.');
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export async function getLowStockInventory(limit = 50) {
  // Prisma does not support comparing two columns in a where clause
  // (e.g. `stock <= low_stock_threshold`) directly via the query builder.
  // Fetch a bounded set ordered by stock and filter in JS by each item's
  // configured `lowStockThreshold`. This keeps the query safe and avoids
  // incorrect references like `prisma.product.fields.lowStockThreshold`.

  const fetchLimit = Math.max(limit, 200);

  const products = await prisma.product.findMany({
    where: { isActive: true, status: 'PUBLISHED' },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      unit: true,
    },
    orderBy: { stock: 'asc' },
    take: fetchLimit,
  });

  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      name: true,
      stock: true,
      lowStockThreshold: true,
      unit: true,
      product: { select: { id: true, name: true, unit: true } },
    },
    orderBy: { stock: 'asc' },
    take: fetchLimit,
  });

  const lowProducts = products.filter((p) => p.lowStockThreshold !== null && p.stock <= p.lowStockThreshold).slice(0, limit);
  const lowVariants = variants.filter((v) => v.lowStockThreshold !== null && v.stock <= v.lowStockThreshold).slice(0, limit);

  return { products: lowProducts, variants: lowVariants };
}

export async function getInventoryHistory(limit = 100) {
  return prisma.inventoryTransaction.findMany({
    include: {
      product: { select: { id: true, name: true, sku: true } },
      variant: { select: { id: true, name: true, sku: true } },
      warehouse: { select: { id: true, name: true, code: true } },
      order: { select: { id: true, orderNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
