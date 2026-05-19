import { captureException } from '@/lib/monitoring';

const REDACTED_KEYS = new Set([
  'authorization',
  'cookie',
  'password',
  'secret',
  'token',
  'keySecret',
  'razorpay_signature',
]);

function redactValue(key: string, value: unknown): unknown {
  if (REDACTED_KEYS.has(key) || /password|secret|token|authorization|cookie|signature/i.test(key)) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogContext(item));
  }

  return sanitizeLogContext(value);
}

function sanitizeLogContext(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : value.stack,
    };
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      redactValue(key, entry),
    ]),
  );
}

function formatLog(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'jk-timbers',
    environment: process.env.NODE_ENV ?? 'development',
    level,
    message,
    context: sanitizeLogContext(context),
  });
}

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(formatLog('error', message, context));
    captureException(context?.error ?? new Error(message), context).catch(() => undefined);
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatLog('warn', message, context));
  },
  info(message: string, context?: Record<string, unknown>) {
    console.info(formatLog('info', message, context));
  },
};
