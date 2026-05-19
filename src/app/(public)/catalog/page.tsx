import { CatalogGrid } from '@/components/catalog/CatalogGrid';
import { getCatalogProducts } from '@/repositories/catalogRepository';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const products = await getCatalogProducts();
  return <CatalogGrid products={products} />;
}
