import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import { hasPermission } from '../src/lib/permissions';
import { rateLimit } from '../src/lib/rateLimiter';
import { matchesRoutePrefix } from '../src/lib/routeMatching';
import { verifyRazorpayWebhookSignature } from '../src/services/paymentProviderService';

// Synchronous Permission Tests
assert.equal(hasPermission(Role.SUPER_ADMIN, Role.ADMIN), true);
assert.equal(hasPermission(Role.ADMIN, Role.STAFF), true);
assert.equal(hasPermission(Role.STAFF, Role.ADMIN), false);
assert.equal(hasPermission(Role.CONTRACTOR, Role.CUSTOMER), true);
assert.equal(hasPermission(Role.USER, Role.STAFF), false);
assert.equal(matchesRoutePrefix('/contractor', '/contractor'), true);
assert.equal(matchesRoutePrefix('/contractor/dashboard', '/contractor'), true);
assert.equal(matchesRoutePrefix('/contractors', '/contractor'), false);
assert.equal(matchesRoutePrefix('/api/admin/products', '/api/admin'), true);
assert.equal(matchesRoutePrefix('/api/administrator', '/api/admin'), false);

// Asynchronous Context Tests
async function runTests() {
  const uniqueIp = `203.0.113.${Math.floor(Math.random() * 100)}`;
  const request = new NextRequest('https://jktimbers.test/api/auth/register', {
    headers: { 'x-forwarded-for': uniqueIp },
  });

  assert.equal((await rateLimit(request, 2, 60_000, 'auth-test')).success, true);
  assert.equal((await rateLimit(request, 2, 60_000, 'auth-test')).success, true);
  assert.equal((await rateLimit(request, 2, 60_000, 'auth-test')).success, false);
  assert.equal((await rateLimit(request, 2, 60_000, 'cart-test')).success, true);

  const previousRazorpaySecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const previousPaymentSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  try {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.PAYMENT_WEBHOOK_SECRET = 'test_webhook_secret';

    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_test', amount: 1000 } } },
    });
    const signature = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    assert.doesNotThrow(() => verifyRazorpayWebhookSignature(signature, payload));
    assert.throws(
      () => verifyRazorpayWebhookSignature('invalid-signature', payload),
      /Invalid Razorpay webhook signature/
    );
  } finally {
    if (previousRazorpaySecret === undefined) {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
    } else {
      process.env.RAZORPAY_WEBHOOK_SECRET = previousRazorpaySecret;
    }

    if (previousPaymentSecret === undefined) {
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    } else {
      process.env.PAYMENT_WEBHOOK_SECRET = previousPaymentSecret;
    }
  }

  console.log('Security core tests passed.');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
