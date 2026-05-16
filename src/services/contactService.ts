import { createContactSubmission } from '@/repositories/contactRepository';

export async function processContactRequest(data: {
  firstName: string;
  lastName?: string;
  phone: string;
  message?: string;
}) {
  // Persist to PostgreSQL
  const submission = await createContactSubmission(data);
  
  // In a production app, trigger an email/SMS notification here
  // e.g., await emailService.sendContactNotification(submission);
  
  return submission;
}
