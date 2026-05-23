import { Queue, Worker, Job } from 'bullmq';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL;

// In-memory queue processor for environments without a configured Redis server
class MemoryQueue<T = unknown> {
  private name: string;
  private handler: (job: { name: string; data: T }) => Promise<unknown> = async () => {};

  constructor(name: string) {
    this.name = name;
  }

  setHandler(handler: (job: { name: string; data: T }) => Promise<unknown>) {
    this.handler = handler;
  }

  async add(jobName: string, data: T, opts?: Record<string, unknown>): Promise<{ id: string; data: T }> {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Execute asynchronously (simulating a background worker process)
    setTimeout(async () => {
      try {
        logger.info(`[MemoryQueue:${this.name}] Starting job: ${jobName}`, { jobId: id, hasOpts: !!opts });
        await this.handler({ name: jobName, data });
        logger.info(`[MemoryQueue:${this.name}] Completed job: ${jobName}`, { jobId: id });
      } catch (err) {
        const error = err as Error;
        logger.error(`[MemoryQueue:${this.name}] Failed job: ${jobName}`, { jobId: id, error: error.message });
      }
    }, 100);

    return { id, data };
  }
}

const memoryQueues = new Map<string, unknown>();

export function getOrCreateQueue<T = unknown>(
  queueName: string,
  processor?: (job: Job<T> | { name: string; data: T }) => Promise<unknown>
): Queue<T> | MemoryQueue<T> {
  if (!REDIS_URL) {
    let memQueue = memoryQueues.get(queueName) as MemoryQueue<T> | undefined;
    if (!memQueue) {
      memQueue = new MemoryQueue<T>(queueName);
      memoryQueues.set(queueName, memQueue);
    }
    if (processor) {
      memQueue.setHandler(processor as (job: { name: string; data: T }) => Promise<unknown>);
    }
    return memQueue;
  }

  // BullMQ Implementation using ioredis
  try {
    const queue = new Queue<T>(queueName, {
      connection: {
        url: REDIS_URL,
      },
    });

    if (processor) {
      const worker = new Worker<T>(
        queueName,
        async (job) => {
          logger.info(`[Queue:${queueName}] Processing job: ${job.name} (ID: ${job.id})`);
          try {
            await processor(job);
          } catch (err) {
            const error = err as Error;
            logger.error(`[Queue:${queueName}] Job failed: ${job.name}`, { jobId: job.id, error: error.message });
            throw err;
          }
        },
        {
          connection: {
            url: REDIS_URL,
          },
          concurrency: 5,
        }
      );

      worker.on('failed', (job, err) => {
        logger.error(`[QueueWorker:${queueName}] Worker reported job failure`, {
          jobId: job?.id,
          jobName: job?.name,
          error: err.message,
        });
      });
    }

    return queue;
  } catch (err) {
    const error = err as Error;
    logger.error(`Failed to construct BullMQ queue: ${queueName}. Falling back to memory queue.`, { error: error.message });
    let memQueue = memoryQueues.get(queueName) as MemoryQueue<T> | undefined;
    if (!memQueue) {
      memQueue = new MemoryQueue<T>(queueName);
      memoryQueues.set(queueName, memQueue);
    }
    if (processor) {
      memQueue.setHandler(processor as (job: { name: string; data: T }) => Promise<unknown>);
    }
    return memQueue;
  }
}
