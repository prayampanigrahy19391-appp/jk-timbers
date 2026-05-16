import { prisma } from '@/lib/prisma';

export async function createContactSubmission(data: {
  firstName: string;
  lastName?: string;
  phone: string;
  message?: string;
}) {
  return prisma.contactSubmission.create({ data });
}
