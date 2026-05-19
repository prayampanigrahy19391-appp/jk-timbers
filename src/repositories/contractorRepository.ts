import { prisma } from '@/lib/prisma';
import { ApplicationStatus, Prisma } from '@prisma/client';

export async function createContractorApplication(data: {
  firstName: string;
  lastName?: string;
  company?: string;
  gstNumber?: string;
  email: string;
  phone?: string;
  city?: string;
  businessType?: string;
  userId?: string;
}) {
  return prisma.contractorApplication.upsert({
    where: { email: data.email.toLowerCase() },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      gstNumber: data.gstNumber,
      phone: data.phone,
      city: data.city,
      businessType: data.businessType,
      userId: data.userId,
      status: ApplicationStatus.PENDING,
    },
    create: {
      ...data,
      email: data.email.toLowerCase(),
    },
  });
}

export async function findContractorApplications(where: Prisma.ContractorApplicationWhereInput = {}) {
  return prisma.contractorApplication.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findContractorApplicationByEmail(email: string) {
  return prisma.contractorApplication.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findContractorApplicationById(id: string) {
  return prisma.contractorApplication.findUnique({
    where: { id },
    include: { user: true },
  });
}
