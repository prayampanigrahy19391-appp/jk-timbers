import crypto from 'crypto';
import type { PaymentProvider } from '@prisma/client';

export type { PaymentProvider };

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return { keyId, keySecret };
}

export function hasRazorpayCredentials() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getRazorpayWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? process.env.PAYMENT_WEBHOOK_SECRET;
}

export async function createRazorpayOrder(options: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentials();
  const url = 'https://api.razorpay.com/v1/orders';
  const payload = {
    amount: Math.round(options.amount * 100),
    currency: options.currency,
    receipt: options.receipt,
    payment_capture: 1,
    notes: options.notes ?? {},
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Razorpay order creation failed: ${body.error?.description || body.error || response.statusText}`);
  }

  return body as {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    created_at: number;
    notes?: Record<string, string>;
  };
}

export function verifyRazorpayWebhookSignature(signature: string | null, payload: string) {
  const secret = getRazorpayWebhookSecret();
  if (!secret) {
    throw new Error('Razorpay webhook secret is not configured. Set RAZORPAY_WEBHOOK_SECRET.');
  }

  if (!signature) {
    throw new Error('Missing Razorpay webhook signature header.');
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid Razorpay webhook signature.');
  }
}

export function verifyRazorpayPaymentSignature(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const { keySecret } = getRazorpayCredentials();
  const payload = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');

  const signatureBuffer = Buffer.from(data.razorpay_signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid Razorpay payment signature.');
  }
}

export async function createRazorpayRefund(options: {
  paymentId: string;
  amount: number;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentials();
  const url = `https://api.razorpay.com/v1/payments/${options.paymentId}/refund`;
  const payload = {
    amount: Math.round(options.amount * 100),
    notes: options.notes ?? {},
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Razorpay refund creation failed: ${body.error?.description || body.error || response.statusText}`);
  }

  return body as {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    payment_id: string;
    status: string;
    notes?: Record<string, string>;
    created_at: number;
  };
}

export function isRazorpayProvider(provider: string) {
  return provider === 'RAZORPAY';
}
