import { randomUUID } from 'crypto';
import {
  CartItemPayload,
  findCartByToken,
  findCartByUserId,
  upsertCart,
  setCartItems,
} from '@/repositories/cartRepository';
import { prisma } from '@/lib/prisma';
import { calculateLinePrice, calculateOrderTotals } from '@/services/pricingService';

export type IncomingCartItem = {
  productId?: string;
  variantId?: string;
  sku?: string;
  quantity: number;
};

function imageFromProduct(product: { thumbnail: string | null; images: unknown }) {
  if (product.thumbnail) return product.thumbnail;
  if (Array.isArray(product.images) && typeof product.images[0] === 'string') {
    return product.images[0];
  }
  return '/textures/teak.webp';
}

async function resolveCartItems(items: IncomingCartItem[]): Promise<CartItemPayload[]> {
  const quantityByKey = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.variantId ?? item.productId ?? item.sku?.trim();
    if (!key) throw new Error('Cart item must include a sku, productId, or variantId.');
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('Cart item quantity must be a positive whole number.');
    }
    acc[key] = (acc[key] ?? 0) + item.quantity;
    return acc;
  }, {});

  const keys = Object.keys(quantityByKey);
  if (keys.length === 0) return [];

  const [variants, products] = await Promise.all([
    prisma.productVariant.findMany({
      where: { OR: [{ id: { in: keys } }, { sku: { in: keys } }] },
      include: { product: { include: { category: true } } },
    }),
    prisma.product.findMany({
      where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }, { sku: { in: keys } }] },
      include: { category: true },
    }),
  ]);

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));
  const variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));
  const productById = new Map(products.map((product) => [product.id, product]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const productBySku = new Map(products.map((product) => [product.sku, product]));

  return keys.map((key) => {
    const variant = variantById.get(key) ?? variantBySku.get(key);
    const product = variant?.product ?? productById.get(key) ?? productBySlug.get(key) ?? productBySku.get(key);
    const quantity = quantityByKey[key];

    if (!product || !product.isActive || product.status !== 'PUBLISHED') {
      throw new Error('One or more cart products are no longer available.');
    }

    if (variant && !variant.isActive) {
      throw new Error(`Variant ${variant.sku} is no longer available.`);
    }

    const availableStock = variant ? variant.stock : product.stock;
    const stockAwareQuantity = Math.min(quantity, Math.max(availableStock, 0));
    if (stockAwareQuantity <= 0) {
      throw new Error(`${product.name} is out of stock.`);
    }

    const pricing = calculateLinePrice({
      unitPrice: variant?.price ?? product.basePrice,
      quantity: stockAwareQuantity,
    });

    return {
      productId: product.id,
      variantId: variant?.id,
      sku: variant?.sku ?? product.sku,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      unit: variant?.unit ?? product.unit,
      image: variant?.image ?? imageFromProduct(product),
      quantity: stockAwareQuantity,
      price: pricing.unitPrice,
      itemSnapshot: {
        slug: product.slug,
        categoryName: product.category.name,
        requestedQuantity: quantity,
        availableStock,
      },
    };
  });
}

export async function getCart(token?: string, userId?: string) {
  if (token) {
    return findCartByToken(token);
  }

  if (userId) {
    return findCartByUserId(userId);
  }

  return null;
}

export async function ensureCart(token?: string, userId?: string) {
  const cartToken = token || randomUUID();
  return upsertCart(cartToken, userId);
}

export async function syncCart(token: string | undefined, userId: string | undefined, items: IncomingCartItem[]) {
  const cartToken = token || randomUUID();
  const cart = await upsertCart(cartToken, userId);
  const resolvedItems = await resolveCartItems(items);
  await setCartItems(cart.id, resolvedItems);
  return findCartByToken(cart.token);
}

export async function validateCart(token: string, userId?: string) {
  const cart = await findCartByToken(token);
  if (!cart || cart.status !== 'ACTIVE') {
    throw new Error('Cart not found.');
  }

  if (userId && cart.userId && cart.userId !== userId) {
    throw new Error('Cart does not belong to this user.');
  }

  const resolvedItems = await resolveCartItems(
    cart.items.map((item) => ({
      productId: item.productId ?? undefined,
      variantId: item.variantId ?? undefined,
      sku: item.sku,
      quantity: item.quantity,
    }))
  );

  const totals = calculateOrderTotals(
    resolvedItems.map((item) => {
      const subtotal = Number(item.price) * item.quantity;
      return { subtotal, discountTotal: 0, total: subtotal };
    })
  );

  return { cart, items: resolvedItems, totals };
}
