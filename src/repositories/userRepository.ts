import { prisma } from '@/lib/prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(userData: Parameters<typeof prisma.user.create>[0]['data']) {
  return prisma.user.create({ data: userData });
}

export async function countUsers() {
  return prisma.user.count();
}
