import assert from 'node:assert/strict';
import { OrderStatus } from '@prisma/client';
import {
  assertAllowedOrderTransition,
  restoresInventoryForTransition,
} from '../src/services/orderStateMachine';
import {
  assertExpectedTotal,
  calculateLinePrice,
  calculateOrderTotals,
} from '../src/services/pricingService';

const line = calculateLinePrice({
  unitPrice: 100,
  quantity: 3,
  contractorDiscountRate: 10,
});

assert.equal(line.subtotal, 300);
assert.equal(line.discountTotal, 30);
assert.equal(line.total, 270);

const totals = calculateOrderTotals([line], { taxRate: 0.18, deliveryFee: 50 });
assert.equal(totals.subtotal, 300);
assert.equal(totals.discountTotal, 30);
assert.equal(totals.taxTotal, 48.6);
assert.equal(totals.deliveryFee, 50);
assert.equal(totals.total, 368.6);

assert.doesNotThrow(() => assertExpectedTotal(368.6, totals.total));
assert.throws(() => assertExpectedTotal(100, totals.total), /Cart total mismatch/);

assert.doesNotThrow(() => assertAllowedOrderTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED));
assert.doesNotThrow(() => assertAllowedOrderTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING));
assert.doesNotThrow(() => assertAllowedOrderTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED));
assert.throws(
  () => assertAllowedOrderTransition(OrderStatus.PENDING, OrderStatus.SHIPPED),
  /Invalid state transition/
);

assert.equal(restoresInventoryForTransition(OrderStatus.PENDING, OrderStatus.CANCELLED), true);
assert.equal(restoresInventoryForTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED), false);
assert.equal(restoresInventoryForTransition(OrderStatus.DELIVERED, OrderStatus.REFUNDED), false);

console.log('Commerce core tests passed.');
