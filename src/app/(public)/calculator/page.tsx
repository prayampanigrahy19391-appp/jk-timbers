import { getCatalogProducts } from '@/repositories/catalogRepository';
import CalculatorClient from './CalculatorClient';

export const dynamic = 'force-dynamic';

export default async function CalculatorPage() {
  const products = await getCatalogProducts();
  return <CalculatorClient products={products} />;
}
