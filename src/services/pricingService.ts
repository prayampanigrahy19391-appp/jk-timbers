import type { Prisma } from '@prisma/client';

const CURRENCY = 'INR' as const;

type MoneyInput = Prisma.Decimal | number | string | null | undefined;

export type LinePricingInput = {
  unitPrice: MoneyInput;
  quantity: number;
  contractorDiscountRate?: MoneyInput;
};

export type PricedLine = {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: typeof CURRENCY;
};

export type OrderTotals = {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryFee: number;
  total: number;
  currency: typeof CURRENCY;
};

export function toMoneyNumber(value: MoneyInput): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return roundMoney(value);
  if (typeof value === 'string') return roundMoney(Number(value.replace(/[^0-9.-]/g, '')) || 0);
  return roundMoney(value.toNumber());
}

export function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function calculateLinePrice(input: LinePricingInput): PricedLine {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Cart item quantity must be a positive whole number.');
  }

  const unitPrice = toMoneyNumber(input.unitPrice);
  const subtotal = roundMoney(unitPrice * input.quantity);
  const discountRate = Math.max(0, Math.min(100, toMoneyNumber(input.contractorDiscountRate)));
  const discountTotal = roundMoney(subtotal * (discountRate / 100));
  const total = roundMoney(subtotal - discountTotal);

  return {
    unitPrice,
    quantity: input.quantity,
    subtotal,
    discountTotal,
    total,
    currency: CURRENCY,
  };
}

export function calculateOrderTotals(
  lines: Pick<PricedLine, 'subtotal' | 'discountTotal' | 'total'>[],
  options: { taxRate?: number; deliveryFee?: number } = {}
): OrderTotals {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const discountTotal = roundMoney(lines.reduce((sum, line) => sum + line.discountTotal, 0));
  const taxableTotal = roundMoney(lines.reduce((sum, line) => sum + line.total, 0));
  const taxRate = options.taxRate ?? 0;
  const taxTotal = roundMoney(taxableTotal * taxRate);
  const deliveryFee = roundMoney(options.deliveryFee ?? 0);
  const total = roundMoney(taxableTotal + taxTotal + deliveryFee);

  return {
    subtotal,
    discountTotal,
    taxTotal,
    deliveryFee,
    total,
    currency: CURRENCY,
  };
}

export function assertExpectedTotal(expected: number | undefined, actual: number) {
  if (expected === undefined) return;

  if (Math.abs(roundMoney(expected) - actual) > 0.01) {
    throw new Error('Cart total mismatch. Please refresh your cart and try again.');
  }
}

export function formatCurrency(value: MoneyInput) {
  return `₹${toMoneyNumber(value).toLocaleString('en-IN')}`;
}
