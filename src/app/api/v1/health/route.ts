import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      cache: 'DOWN',
    },
    system: {
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    },
  };

  let isHealthy = true;

  // 1. Verify PostgreSQL Database
  try {
    // Run simple query
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'UP';
  } catch (err) {
    const error = err as Error;
    logger.error('Health check failed: database connectivity issue', { error: error.message });
    isHealthy = false;
  }

  // 2. Verify Redis / Cache
  try {
    const pingResult = await redis.ping();
    if (pingResult === 'PONG') {
      status.services.cache = 'UP';
    }
  } catch (err) {
    const error = err as Error;
    logger.error('Health check failed: caching service issue', { error: error.message });
    // Cache down doesn't necessarily block app runtime (has in-memory fallbacks)
  }

  // Return appropriate HTTP status
  return NextResponse.json(
    {
      success: isHealthy,
      ...status,
    },
    {
      status: isHealthy ? 200 : 503,
    }
  );
}
