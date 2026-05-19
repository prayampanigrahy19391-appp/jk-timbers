import assert from 'node:assert/strict';

const disposableDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!disposableDatabaseUrl) {
  console.log('Checkout integration tests skipped: TEST_DATABASE_URL is not configured.');
} else {
  assert.match(disposableDatabaseUrl, /schema=|\/[^/?]+_test(?:[/?]|$)/, 'TEST_DATABASE_URL must point to a disposable test database or schema.');
  console.log('Checkout integration test harness is configured for a disposable database.');
}
