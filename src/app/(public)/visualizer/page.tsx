import { getCatalogProducts } from '@/repositories/catalogRepository';
import VisualizerClient from './VisualizerClient';

export default async function VisualizerPage() {
  const products = await getCatalogProducts();
  return <VisualizerClient products={products} />;
}
