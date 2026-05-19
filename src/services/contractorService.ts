import {
  createContractorApplication,
  findContractorApplicationByEmail,
  findContractorApplicationById,
  findContractorApplications,
} from '@/repositories/contractorRepository';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus, Role } from '@prisma/client';

export async function processContractorApplication(data: {
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
  const existing = await findContractorApplicationByEmail(data.email);
  if (existing?.status === ApplicationStatus.APPROVED) {
    throw new Error('This contractor account is already approved.');
  }

  const application = await createContractorApplication(data);

  return application;
}

export async function listContractorApplications(status?: ApplicationStatus) {
  return findContractorApplications(status ? { status } : {});
}

export async function reviewContractorApplication(
  applicationId: string,
  input: {
    status: ApplicationStatus;
    adminNotes?: string;
    discountRate?: number;
    reviewedById?: string;
  }
) {
  const application = await findContractorApplicationById(applicationId);
  if (!application) {
    throw new Error('Contractor application not found.');
  }

  return prisma.$transaction(async (tx) => {
    let userId = application.userId;

    if (input.status === ApplicationStatus.APPROVED) {
      const user = application.userId
        ? await tx.user.update({
            where: { id: application.userId },
            data: { role: Role.CONTRACTOR },
          })
        : await tx.user.upsert({
            where: { email: application.email },
            update: { role: Role.CONTRACTOR, name: `${application.firstName} ${application.lastName ?? ''}`.trim() },
            create: {
              email: application.email,
              name: `${application.firstName} ${application.lastName ?? ''}`.trim(),
              phone: application.phone,
              role: Role.CONTRACTOR,
            },
          });

      userId = user.id;
    }

    return tx.contractorApplication.update({
      where: { id: applicationId },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        discountRate: input.status === ApplicationStatus.APPROVED ? input.discountRate ?? application.discountRate ?? 0 : null,
        approvedAt: input.status === ApplicationStatus.APPROVED ? new Date() : null,
        reviewedAt: new Date(),
        reviewedById: input.reviewedById,
        userId,
      },
    });
  });
}
