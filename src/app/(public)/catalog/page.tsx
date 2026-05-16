import { CatalogGrid } from '@/components/catalog/CatalogGrid';
import { getCatalogProducts } from '@/repositories/catalogRepository';

export default async function CatalogPage() {
  const products = await getCatalogProducts();
  return <CatalogGrid products={products} />;
}
