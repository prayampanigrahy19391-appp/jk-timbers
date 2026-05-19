import { getCatalogProducts } from '@/repositories/catalogRepository';
import VisualizerClient from './VisualizerClient';

export const dynamic = 'force-dynamic';

export default async function VisualizerPage() {
  const products = await getCatalogProducts();
  return <VisualizerClient products={products} />;
}
