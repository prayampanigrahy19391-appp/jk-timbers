import { prisma } from '@/lib/prisma';

export async function createContractorApplication(data: {
  firstName: string;
  lastName?: string;
  company?: string;
  gstNumber?: string;
  email: string;
}) {
  return prisma.contractorApplication.create({ data });
}
