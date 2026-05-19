import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type PublicProductSearchFilters = {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  tagIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  specifications?: Record<string, string | number | boolean>;
  sort?: 'priceAsc' | 'priceDesc' | 'newest' | 'nameAsc';
  page?: number;
  pageSize?: number;
};

export async function findProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      media: true,
      productTags: { include: { tag: true } },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function findProductsByIds(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids }, status: 'PUBLISHED', isActive: true },
  });
}

export async function findProductsBySlugsOrIds(keys: string[]) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      isActive: true,
      OR: [{ id: { in: keys } }, { slug: { in: keys } }],
    },
  });
}

export async function findProductsBySlugs(slugs: string[]) {
  return prisma.product.findMany({
    where: { slug: { in: slugs }, status: 'PUBLISHED', isActive: true },
  });
}

export async function findVariantBySku(sku: string) {
  return prisma.productVariant.findUnique({
    where: { sku },
    include: { product: true },
  });
}

export async function findVariantsBySkus(skus: string[]) {
  return prisma.productVariant.findMany({
    where: { sku: { in: skus } },
    include: { product: true },
  });
}

export async function searchPublicProducts(filters: PublicProductSearchFilters) {
  const {
    query,
    categoryId,
    categorySlug,
    tagIds,
    minPrice,
    maxPrice,
    inStock,
    specifications,
    sort,
    page = 1,
    pageSize = 24,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: 'PUBLISHED',
    isActive: true,
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {},
      categoryId ? { categoryId } : {},
      categorySlug ? { category: { slug: categorySlug, isActive: true } } : {},
      tagIds ? { productTags: { some: { tagId: { in: tagIds } } } } : {},
      minPrice !== undefined ? { basePrice: { gte: minPrice } } : {},
      maxPrice !== undefined ? { basePrice: { lte: maxPrice } } : {},
      inStock ? { stock: { gt: 0 } } : {},
      ...(specifications
        ? Object.entries(specifications).map(([path, value]) => ({
            specifications: { path: [path], equals: value },
          }))
        : []),
    ],
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'priceAsc'
      ? { basePrice: Prisma.SortOrder.asc }
      : sort === 'priceDesc'
      ? { basePrice: Prisma.SortOrder.desc }
      : sort === 'newest'
      ? { createdAt: Prisma.SortOrder.desc }
      : sort === 'nameAsc'
      ? { name: Prisma.SortOrder.asc }
      : { createdAt: Prisma.SortOrder.desc };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(60, Math.max(1, pageSize));

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true, media: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize),
    },
  };
}

export async function countLowStockProducts() {
  const [products, variants] = await Promise.all([
    prisma.product.count({ where: { stock: { lt: 10 }, status: 'PUBLISHED', isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lt: 10 }, isActive: true } }),
  ]);

  return products + variants;
}

/** Fetch all products with their categories for admin inventory view. */
export async function findAllProductsWithCategory() {
  return prisma.product.findMany({
    include: {
      category: true,
      media: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { sortOrder: 'asc' } },
      productTags: { include: { tag: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
