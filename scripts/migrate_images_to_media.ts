import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');
  console.log(`Starting media migration (dryRun=${dryRun})`);

  const batchSize = 200;
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const products = await prisma.product.findMany({
      where: { images: { not: null } },
      select: { id: true, images: true, name: true },
      skip: offset,
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    if (products.length === 0) break;

    for (const product of products) {
      const images = Array.isArray(product.images) ? product.images.filter((i) => typeof i === 'string') : [];
      if (images.length === 0) continue;

      console.log(`Product ${product.id} (${product.name}) => ${images.length} images`);

      const createPayload = images.map((url: string, idx: number) => ({
        productId: product.id,
        type: 'IMAGE',
        url,
        storageKey: null,
        altText: null,
        mimeType: null,
        size: null,
        width: null,
        height: null,
        isPrimary: idx === 0,
        sortOrder: idx,
      }));

      if (dryRun) {
        console.log('  dry-run -> would create', createPayload.length, 'media rows');
      } else {
        await prisma.productMedia.createMany({ data: createPayload });
        totalProcessed += createPayload.length;
      }
    }

    offset += products.length;
  }

  console.log(`Migration complete. totalProcessed=${totalProcessed}`);
}

run()
  .catch((err) => {
    console.error('Migration failed', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
