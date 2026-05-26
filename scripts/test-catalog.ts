import { getCatalogProducts, getCatalogProductById } from '../src/repositories/catalogRepository';

async function test() {
  try {
    console.log('Fetching catalog products...');
    const products = await getCatalogProducts();
    console.log(`Successfully fetched ${products.length} products:`);
    console.log(JSON.stringify(products.slice(0, 2), null, 2));

    if (products.length > 0) {
      const firstSlug = products[0].id;
      console.log(`\nFetching product detail for slug: ${firstSlug}...`);
      const detail = await getCatalogProductById(firstSlug);
      console.log('Successfully fetched details:');
      console.log(JSON.stringify(detail, null, 2));
    }
  } catch (err) {
    console.error('ERROR during catalog fetch:', err);
  }
}

test().catch(console.error);
