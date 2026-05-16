import { prisma } from '@/lib/prisma';
import type { StaticProduct } from '@/types/product';
import type { Product, Category } from '@prisma/client';

/** Convert a Prisma DB Product to the StaticProduct format the UI expects */
function mapToStaticProduct(dbProduct: Product & { category?: Category | null }): StaticProduct {
  let image = '/textures/teak.webp';
  let features: string[] = [];
  
  try {
    const images = dbProduct.images as string[];
    if (Array.isArray(images) && images.length > 0) image = images[0];
    if (Array.isArray(dbProduct.features)) features = dbProduct.features;
  } catch {}

  return {
    id: dbProduct.slug,
    name: dbProduct.name,
    category: dbProduct.category?.name || 'Timber',
    price: dbProduct.price ? `₹${dbProduct.price.toNumber().toLocaleString('en-IN')}` : 'Contact for Price',
    unit: dbProduct.unit,
    image,
    badge: dbProduct.badge,
    description: dbProduct.description,
    features,
    origin: dbProduct.origin || 'Various',
    stock: dbProduct.stock > 0 ? `In Stock (${dbProduct.stock} ${dbProduct.unit})` : 'Out of Stock',
  };
}

export async function getCatalogProducts(): Promise<StaticProduct[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return products.map(mapToStaticProduct);
}

export async function getCatalogProductById(slug: string): Promise<StaticProduct | undefined> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });
  
  return product ? mapToStaticProduct(product) : undefined;
}
