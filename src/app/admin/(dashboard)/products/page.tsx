import { getAdminProducts, listAdminCategories } from '@/services/productService';
import AdminProductManager from '@/components/admin/AdminProductManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), listAdminCategories()]);

  const serializableProducts = products.map((product) => {
    const safeImages = Array.isArray(product.images)
      ? (product.images.filter((item) => typeof item === 'string') as string[])
      : [];

    return {
      ...product,
      basePrice: product.basePrice.toNumber(),
      stock: product.stock ?? 0,
      thumbnail: product.thumbnail ?? null,
      images: safeImages,
      productTags: Array.isArray(product.productTags) ? product.productTags : [],
    };
  });

  return <AdminProductManager products={serializableProducts} categories={categories} />;
}
