import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

export type CartItemPayload = {
  productId?: string;
  variantId?: string;
  sku: string;
  name: string;
  unit: string;
  image: string;
  quantity: number;
  price: string | number;
  itemSnapshot?: Record<string, unknown>;
};

export async function findCartByToken(token: string) {
  return prisma.cart.findUnique({
    where: { token },
    include: { items: true },
  });
}

export async function findCartByUserId(userId: string) {
  return prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: true },
  });
}

export async function createCart(token: string, userId?: string) {
  return prisma.cart.create({
    data: {
      token,
      userId,
      total: 0,
      status: 'ACTIVE',
    },
  });
}

export async function upsertCart(token: string, userId?: string) {
  const existing = await findCartByToken(token);

  if (existing) {
    if (existing.status === 'CHECKED_OUT') {
      return createCart(randomUUID(), userId);
    }

    if (existing.status !== 'ACTIVE') {
      return prisma.cart.update({
        where: { token },
        data: { userId: userId ?? existing.userId, status: 'ACTIVE', checkedOutAt: null },
        include: { items: true },
      });
    }

    if (userId && !existing.userId) {
      return prisma.cart.update({
        where: { token },
        data: { userId },
        include: { items: true },
      });
    }

    return existing;
  }

  return createCart(token, userId);
}

export async function setCartItems(cartId: string, items: CartItemPayload[]) {
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const operations = [
    prisma.cartItem.deleteMany({ where: { cartId } }),
    ...(items.length > 0
      ? [
          prisma.cartItem.createMany({
            data: items.map((item) => ({
        cartId,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        itemSnapshot: item.itemSnapshot as Prisma.InputJsonValue | undefined,
      })),
          }),
        ]
      : []),
    prisma.cart.update({
      where: { id: cartId },
      data: { total },
    }),
  ];

  return prisma.$transaction(operations);
}

export async function deleteCart(cartId: string) {
  return prisma.cart.delete({ where: { id: cartId } });
}
