import assert from 'node:assert/strict';
import {
  adminProductVariantSchema,
  checkoutRequestSchema,
  contractorReviewSchema,
  inventoryAdjustmentSchema,
} from '../src/schemas/apiSchema';

const validCheckout = checkoutRequestSchema.safeParse({
  cartToken: 'cart-token',
  customer: {
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+91 9876543210',
    address: 'Test address',
    city: 'Bhubaneswar',
    zipCode: '751001',
  },
  paymentMethod: 'COD',
  total: 100,
});

assert.equal(validCheckout.success, true);
if (!validCheckout.success) {
  throw new Error('Expected checkout fixture to be valid.');
}
const validCheckoutData = validCheckout.data;
assert.equal(checkoutRequestSchema.safeParse({ ...validCheckoutData, total: -1 }).success, false);
assert.equal(checkoutRequestSchema.safeParse({ ...validCheckoutData, paymentProvider: 'FAKEPAY' }).success, false);

assert.equal(adminProductVariantSchema.safeParse({
  sku: 'SKU-1',
  name: 'Variant',
  price: 10,
  stock: 0,
}).success, true);
assert.equal(adminProductVariantSchema.safeParse({
  sku: 'SKU-1',
  name: 'Variant',
  price: 10,
  stock: -1,
}).success, false);

assert.equal(inventoryAdjustmentSchema.safeParse({
  quantityChange: 10,
  reason: 'Manual stock count',
}).success, false);

assert.equal(contractorReviewSchema.safeParse({
  status: 'APPROVED',
  discountRate: 101,
}).success, false);

console.log('API schema tests passed.');
