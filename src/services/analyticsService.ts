import { logger } from '@/lib/logger';
import { getOrCreateQueue } from '@/lib/queue';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  anonymousId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

// Background processor to ship analytics events to warehouse (BigQuery / Segment / Amplitude)
const processAnalyticsBatch = async (job: { data: { events: AnalyticsEvent[] } }) => {
  const events = job.data.events;

  logger.info(`[AnalyticsWorker] Shipping batch of ${events.length} events to data lake...`);

  // Simulate remote batch delivery API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Log successful upload
  logger.info(`[AnalyticsWorker] Successfully uploaded batch of ${events.length} events.`);
};

// Queue configuration
const analyticsQueue = getOrCreateQueue<{ events: AnalyticsEvent[] }>('analytics-pipeline', processAnalyticsBatch);

// Batching buffer
let eventBuffer: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE_LIMIT = 50;
const FLUSH_INTERVAL_MS = 10000; // Flush buffer every 10 seconds

const flushEvents = async () => {
  if (eventBuffer.length === 0) return;

  const batchToShip = [...eventBuffer];
  eventBuffer = [];
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  logger.info(`[AnalyticsService] Queueing batch of ${batchToShip.length} events for processing`);

  await analyticsQueue.add('ship-batch', { events: batchToShip }, {
    attempts: 3,
    removeOnComplete: true,
  });
};

export function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  userId?: string,
  anonymousId?: string
) {
  const event: AnalyticsEvent = {
    eventName,
    userId,
    anonymousId,
    properties,
    timestamp: new Date().toISOString(),
  };

  eventBuffer.push(event);
  logger.info(`[AnalyticsService] Captured event: ${eventName}`, { userId, anonymousId });

  if (eventBuffer.length >= BATCH_SIZE_LIMIT) {
    flushEvents().catch((err) => {
      logger.error('Failed to flush analytics events', { error: err.message });
    });
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushEvents().catch((err) => {
        logger.error('Failed to flush analytics events', { error: err.message });
      });
    }, FLUSH_INTERVAL_MS);
  }
}
