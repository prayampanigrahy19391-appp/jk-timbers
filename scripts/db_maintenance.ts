import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMaintenance() {
  console.log(`[${new Date().toISOString()}] Starting Database Maintenance Job...`);

  try {
    // 1. Clean up Abandoned Carts older than 14 days
    const expirationThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    console.log(`[Maintenance] Cleaning up carts created before: ${expirationThreshold.toISOString()}`);

    const cartCleanup = await prisma.cart.deleteMany({
      where: {
        status: 'ABANDONED',
        updatedAt: {
          lt: expirationThreshold,
        },
      },
    });

    console.log(`[Maintenance] Successfully deleted ${cartCleanup.count} abandoned carts.`);

    // 2. Archive or clean up old log entries if required
    // (e.g. PaymentEvents, PaymentAuditLogs older than 90 days)
    const logThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const logsCleanup = await prisma.paymentEvent.deleteMany({
      where: {
        receivedAt: {
          lt: logThreshold,
        },
      },
    });

    console.log(`[Maintenance] Successfully pruned ${logsCleanup.count} payment events older than 90 days.`);

    // 3. Database Index Optimization (Optional & depending on dialect)
    // Runs index statistics updates in PostgreSQL
    console.log('[Maintenance] Re-indexing tables (running ANALYZE)...');
    await prisma.$executeRawUnsafe('ANALYZE users;');
    await prisma.$executeRawUnsafe('ANALYZE products;');
    await prisma.$executeRawUnsafe('ANALYZE orders;');
    console.log('[Maintenance] Tables analysis complete.');

    console.log(`[${new Date().toISOString()}] Database Maintenance Job successfully completed.`);
  } catch (err) {
    const error = err as Error;
    console.error(`[Maintenance:Error] Database maintenance failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMaintenance();
