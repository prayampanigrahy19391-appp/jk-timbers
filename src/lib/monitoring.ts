type MonitoringContext = Record<string, unknown>;

type SentryModule = {
  init(config: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    release?: string;
    integrations: unknown[];
  }): void;
  captureException(error: Error, options?: { extra?: MonitoringContext }): void;
  captureMessage(message: string, options?: { extra?: MonitoringContext }): void;
};

const sentryDsn = process.env.SENTRY_DSN;
let sentryReady = false;
let sentryModule: SentryModule | null = null;
let sentryUnavailable = false;

const optionalImport = new Function(
  'specifier',
  'return import(specifier)',
) as (specifier: string) => Promise<SentryModule>;

async function loadSentry(): Promise<SentryModule | null> {
  if (sentryModule) {
    return sentryModule;
  }

  if (sentryUnavailable) {
    return null;
  }

  try {
    sentryModule = await optionalImport('@sentry/nextjs');
    return sentryModule;
  } catch (error) {
    sentryUnavailable = true;
    console.warn(
      '[monitoring] Sentry unavailable. Install @sentry/nextjs and configure SENTRY_DSN to enable external error monitoring.',
      error,
    );
    return null;
  }
}

async function ensureSentryInitialized(): Promise<boolean> {
  if (!sentryDsn || sentryReady) {
    return Boolean(sentryReady);
  }

  const Sentry = await loadSentry();
  if (!Sentry) {
    return false;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV ?? 'production',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA,
    integrations: [],
  });

  sentryReady = true;
  return true;
}

export async function captureException(error: unknown, context?: MonitoringContext) {
  if (!sentryDsn) {
    return;
  }

  if (!(await ensureSentryInitialized())) {
    return;
  }

  try {
    const Sentry = await loadSentry();
    Sentry?.captureException(error instanceof Error ? error : new Error(String(error)), {
      extra: context,
    });
  } catch (captureError) {
    console.warn('[monitoring] Failed to capture exception:', captureError);
  }
}

export async function captureMessage(message: string, context?: MonitoringContext) {
  if (!sentryDsn) {
    return;
  }

  if (!(await ensureSentryInitialized())) {
    return;
  }

  try {
    const Sentry = await loadSentry();
    Sentry?.captureMessage(message, {
      extra: context,
    });
  } catch (captureError) {
    console.warn('[monitoring] Failed to capture message:', captureError);
  }
}
