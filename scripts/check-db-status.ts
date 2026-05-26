import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  console.log('--- DATABASE STATUS ---');
  console.log('Users count:', users);
  console.log('Products count:', products);
  console.log('Categories count:', categories);
  
  if (products > 0) {
    const sample = await prisma.product.findFirst({
      select: { name: true, slug: true, isActive: true, status: true }
    });
    console.log('Sample Product:', sample);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
