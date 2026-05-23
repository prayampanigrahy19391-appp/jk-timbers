import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { getOrCreateQueue } from '@/lib/queue';

export interface WebhookSubscription {
  id: string;
  url: string;
  secret: string;
  events: string[];
}

export interface WebhookPayload {
  eventId: string;
  event: string;
  timestamp: string;
  data: unknown;
}

export interface WebhookDispatchJobData {
  subscription: WebhookSubscription;
  payload: WebhookPayload;
}

// Background dispatcher for webhooks
const processWebhookDispatch = async (job: { id?: string; data: WebhookDispatchJobData }) => {
  const { subscription, payload } = job.data;
  const { url, secret } = subscription;

  logger.info(`[WebhookDispatcher] Dispatching ${payload.event} to ${url} (Job: ${job.id ?? 'unknown'})`);

  // Construct JSON body
  const body = JSON.stringify(payload);

  // Compute HMAC signature for payload authentication (zero-trust contract)
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  // Trigger POST request
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-JKTimbers-Signature': signature,
      'X-JKTimbers-Event': payload.event,
      'X-JKTimbers-Delivery-Id': payload.eventId,
      'User-Agent': 'JKTimbers-Webhook-Dispatcher/1.0',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Partner endpoint returned bad status: ${response.status} ${response.statusText}`);
  }

  logger.info(`[WebhookDispatcher] Successfully delivered event: ${payload.event} to ${url}`);
};

// Queue configuration
const webhookQueue = getOrCreateQueue<WebhookDispatchJobData>('webhook-dispatcher', processWebhookDispatch);

// In a real application, subscriptions are fetched from a DB table like `WebhookSubscription`
// For evolution demonstration, we simulate fetching matching subscriptions for the event type
const getSubscriptionsForEvent = async (event: string): Promise<WebhookSubscription[]> => {
  const partnerEndpoint = process.env.B2B_WEBHOOK_URL;
  const partnerSecret = process.env.B2B_WEBHOOK_SECRET;

  if (!partnerEndpoint) return [];

  logger.info('Resolving B2B webhook subscriptions', { event });

  return [
    {
      id: 'sub_default_b2b_partner',
      url: partnerEndpoint,
      secret: partnerSecret ?? 'superSecretB2BKey',
      events: ['order.created', 'order.shipped', 'inventory.low'],
    },
  ];
};

export async function dispatchEcosystemEvent(event: string, data: unknown) {
  try {
    const subscriptions = await getSubscriptionsForEvent(event);
    const matchingSubs = subscriptions.filter((sub) => sub.events.includes(event));

    if (matchingSubs.length === 0) return;

    const payload: WebhookPayload = {
      eventId: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const sub of matchingSubs) {
      await webhookQueue.add(
        `dispatch-${event}`,
        { subscription: sub, payload },
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        }
      );
    }
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to queue webhook dispatch', { error: error.message, event });
  }
}
