import { logger } from '@/lib/logger';
import { trackEvent } from './analyticsService';

export interface UserInteractionEvent {
  userId?: string;
  anonymousId: string;
  sessionId: string;
  userRole?: string;
  productId?: string;
  categorySlug?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
}

export function trackProductView(event: UserInteractionEvent) {
  if (!event.productId) return;
  
  logger.info('[BehaviorTracker] Tracking product view', {
    productId: event.productId,
    userId: event.userId,
    anonymousId: event.anonymousId,
  });

  trackEvent(
    'product.viewed',
    {
      productId: event.productId,
      sessionId: event.sessionId,
      userRole: event.userRole || 'GUEST',
      ...(event.metadata || {}),
    },
    event.userId,
    event.anonymousId
  );
}

export function trackSearchQuery(event: UserInteractionEvent) {
  if (!event.searchQuery) return;

  logger.info('[BehaviorTracker] Tracking search query', {
    query: event.searchQuery,
    userId: event.userId,
    anonymousId: event.anonymousId,
  });

  trackEvent(
    'catalog.searched',
    {
      query: event.searchQuery,
      sessionId: event.sessionId,
      userRole: event.userRole || 'GUEST',
      ...(event.metadata || {}),
    },
    event.userId,
    event.anonymousId
  );
}

export function trackCartInteraction(action: 'add' | 'remove', event: UserInteractionEvent) {
  if (!event.productId) return;

  logger.info(`[BehaviorTracker] Tracking cart ${action}`, {
    productId: event.productId,
    userId: event.userId,
    anonymousId: event.anonymousId,
  });

  trackEvent(
    `cart.item.${action}ed`,
    {
      productId: event.productId,
      sessionId: event.sessionId,
      userRole: event.userRole || 'GUEST',
      ...(event.metadata || {}),
    },
    event.userId,
    event.anonymousId
  );
}

export function trackCheckoutFunnel(step: number, stepName: string, event: UserInteractionEvent) {
  logger.info(`[BehaviorTracker] Tracking checkout step ${step}: ${stepName}`, {
    userId: event.userId,
    anonymousId: event.anonymousId,
  });

  trackEvent(
    'checkout.funnel.step',
    {
      step,
      stepName,
      sessionId: event.sessionId,
      userRole: event.userRole || 'GUEST',
      ...(event.metadata || {}),
    },
    event.userId,
    event.anonymousId
  );
}
