import { createContractorApplication } from '@/repositories/contractorRepository';

export async function processContractorApplication(data: {
  firstName: string;
  lastName?: string;
  company?: string;
  gstNumber?: string;
  email: string;
}) {
  // Persist to PostgreSQL
  const application = await createContractorApplication(data);
  
  // In a production app, trigger an email notification here
  // e.g., await emailService.sendContractorReviewNotification(application);
  
  return application;
}
