import { getCatalogProducts, getCatalogProductById } from '@/repositories/catalogRepository';
import { findAllProductsWithCategory, findProductBySlug, searchPublicProducts } from '@/repositories/productRepository';
import { findAllOrdersForCustomerAggregation } from '@/repositories/orderRepository';
import { prisma } from '@/lib/prisma';
import type { CustomerProfile } from '@/types/admin';
import type { PublicProductSearchFilters } from '@/repositories/productRepository';
import { MediaType, Prisma, ProductStatus } from '@prisma/client';

export function fetchCatalogProducts() {
  return getCatalogProducts();
}

export function fetchCatalogProductById(id: string) {
  return getCatalogProductById(id);
}

export async function searchCatalogProducts(filters: PublicProductSearchFilters) {
  return searchPublicProducts(filters);
}

export async function fetchCatalogProductBySlug(slug: string) {
  return findProductBySlug(slug);
}

/** Fetch all products from database for admin inventory. */
export async function getAdminProducts() {
  return findAllProductsWithCategory();
}

export type ProductVariantWriteInput = {
  id?: string;
  sku: string;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  attributes?: Record<string, unknown>;
  dimensions?: Record<string, unknown>;
  stock?: number;
  lowStockThreshold?: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type ProductMediaWriteInput = {
  id?: string;
  type?: MediaType | keyof typeof MediaType;
  url: string;
  storageKey?: string;
  altText?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type ProductWriteInput = {
  name: string;
  slug?: string;
  sku: string;
  categoryId: string;
  status?: ProductStatus | keyof typeof ProductStatus;
  description: string;
  basePrice: number;
  unit?: string;
  stock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  badge?: string | null;
  features?: string[];
  specifications?: Record<string, unknown>;
  searchKeywords?: string[];
  origin?: string | null;
  thumbnail?: string | null;
  images?: string[];
  model3D?: string | null;
  thickness?: string | null;
  density?: string | null;
  durabilityScore?: number | null;
  waterResistant?: boolean;
  fireResistant?: boolean;
  termiteResistant?: boolean;
  weight?: string | null;
  dimensions?: string | null;
  grade?: string | null;
  warranty?: string | null;
  deliveryTimeline?: string | null;
  variants?: ProductVariantWriteInput[];
  media?: ProductMediaWriteInput[];
  tagNames?: string[];
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productDataFromInput(input: ProductWriteInput) {
  const status = (input.status ?? ProductStatus.DRAFT) as ProductStatus;

  return {
    name: input.name,
    slug: input.slug ? slugify(input.slug) : slugify(input.name),
    sku: input.sku,
    categoryId: input.categoryId,
    status,
    description: input.description,
    basePrice: input.basePrice,
    unit: input.unit ?? 'sq.ft',
    stock: input.stock ?? 0,
    lowStockThreshold: input.lowStockThreshold ?? 10,
    isActive: input.isActive ?? true,
    badge: input.badge,
    features: input.features ?? [],
    specifications: input.specifications ? input.specifications as Prisma.InputJsonValue : Prisma.JsonNull,
    searchKeywords: input.searchKeywords ?? [],
    origin: input.origin,
    thumbnail: input.thumbnail,
    images: input.images ?? [],
    model3D: input.model3D,
    thickness: input.thickness,
    density: input.density,
    durabilityScore: input.durabilityScore,
    waterResistant: input.waterResistant ?? false,
    fireResistant: input.fireResistant ?? false,
    termiteResistant: input.termiteResistant ?? false,
    weight: input.weight,
    dimensions: input.dimensions,
    grade: input.grade,
    warranty: input.warranty,
    deliveryTimeline: input.deliveryTimeline,
    publishedAt: status === ProductStatus.PUBLISHED ? new Date() : null,
  };
}

async function syncProductTags(tx: Prisma.TransactionClient, productId: string, tagNames?: string[]) {
  if (!tagNames) return;

  await tx.productTag.deleteMany({ where: { productId } });

  for (const name of tagNames) {
    const normalized = name.trim();
    if (!normalized) continue;

    const tag = await tx.tag.upsert({
      where: { slug: slugify(normalized) },
      update: { name: normalized },
      create: { name: normalized, slug: slugify(normalized) },
    });

    await tx.productTag.create({
      data: { productId, tagId: tag.id },
    });
  }
}

async function syncProductMedia(tx: Prisma.TransactionClient, productId: string, media?: ProductMediaWriteInput[]) {
  if (!media) return;

  await tx.productMedia.deleteMany({ where: { productId } });

  if (media.length === 0) return;

  await tx.productMedia.createMany({
    data: media.map((item, index) => ({
      productId,
      type: (item.type ?? MediaType.IMAGE) as MediaType,
      url: item.url,
      storageKey: item.storageKey,
      altText: item.altText,
      mimeType: item.mimeType,
      size: item.size,
      width: item.width,
      height: item.height,
      isPrimary: item.isPrimary ?? index === 0,
      sortOrder: item.sortOrder ?? index,
    })),
  });
}

async function syncProductVariants(tx: Prisma.TransactionClient, productId: string, variants?: ProductVariantWriteInput[]) {
  if (!variants) return;

  const seenIds = variants.map((variant) => variant.id).filter(Boolean) as string[];
  if (seenIds.length > 0) {
    await tx.productVariant.updateMany({
      where: { productId, id: { notIn: seenIds } },
      data: { isActive: false },
    });
  }

  for (const variant of variants) {
    const data = {
      productId,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      unit: variant.unit,
      image: variant.image,
      attributes: variant.attributes ? variant.attributes as Prisma.InputJsonValue : Prisma.JsonNull,
      dimensions: variant.dimensions ? variant.dimensions as Prisma.InputJsonValue : Prisma.JsonNull,
      stock: variant.stock ?? 0,
      lowStockThreshold: variant.lowStockThreshold ?? 10,
      sortOrder: variant.sortOrder ?? 0,
      isActive: variant.isActive ?? true,
    };

    if (variant.id) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data,
      });
    } else {
      await tx.productVariant.upsert({
        where: { sku: variant.sku },
        update: data,
        create: data,
      });
    }
  }
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    include: { subcategories: { orderBy: { sortOrder: 'asc' } }, parentCategory: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function createAdminCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      description: input.description,
      image: input.image,
      parentId: input.parentId,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function createAdminProduct(input: ProductWriteInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: productDataFromInput(input),
    });

    await syncProductTags(tx, product.id, input.tagNames);
    await syncProductMedia(tx, product.id, input.media);
    await syncProductVariants(tx, product.id, input.variants);

    return tx.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { category: true, variants: true, media: true, productTags: { include: { tag: true } } },
    });
  });
}

export async function updateAdminProduct(productId: string, input: ProductWriteInput) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: productDataFromInput(input),
    });

    await syncProductTags(tx, updated.id, input.tagNames);
    await syncProductMedia(tx, updated.id, input.media);
    await syncProductVariants(tx, updated.id, input.variants);

    return tx.product.findUniqueOrThrow({
      where: { id: updated.id },
      include: { category: true, variants: true, media: true, productTags: { include: { tag: true } } },
    });
  });
}

export async function archiveAdminProduct(productId: string) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      status: ProductStatus.ARCHIVED,
      isActive: false,
    },
  });
}

/** Aggregate orders by customer contact info to build customer profiles. */
export async function getCustomerProfiles(): Promise<CustomerProfile[]> {
  const orders = await findAllOrdersForCustomerAggregation();

  const customersMap = new Map<string, CustomerProfile>();

  orders.forEach((order) => {
    const key = order.email || order.phone || order.id;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        id: key,
        name: order.customerName || 'Guest Customer',
        email: order.email || 'N/A',
        phone: order.phone || 'N/A',
        location: order.city ? `${order.city}, ${order.zipCode}` : 'N/A',
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: order.createdAt,
      });
    }

    const customer = customersMap.get(key)!;
    customer.totalOrders += 1;
    customer.totalSpend += order.total.toNumber();
  });

  return Array.from(customersMap.values());
}
