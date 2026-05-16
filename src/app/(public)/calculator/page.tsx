import { getCatalogProducts } from '@/repositories/catalogRepository';
import CalculatorClient from './CalculatorClient';

export default async function CalculatorPage() {
  const products = await getCatalogProducts();
  return <CalculatorClient products={products} />;
}
