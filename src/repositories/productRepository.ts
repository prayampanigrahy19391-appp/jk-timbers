import { prisma } from '@/lib/prisma';


export async function findProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true }
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function findProductsByIds(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids }, isActive: true }
  });
}

export async function findProductsBySlugs(slugs: string[]) {
  return prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true }
  });
}

export async function countLowStockProducts() {
  return prisma.product.count({ where: { stock: { lt: 10 }, isActive: true } });
}

/** Fetch all products with their categories for admin inventory view. */
export async function findAllProductsWithCategory() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}
