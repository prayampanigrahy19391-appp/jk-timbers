import { getOrCreateQueue } from '@/lib/queue';
import { logger } from '@/lib/logger';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
}

// Background email processor mock integration (AWS SES / SendGrid / Resend)
const processEmailJob = async (job: { data: EmailJobData }) => {
  const { to, subject, body, templateId, templateData } = job.data;

  logger.info('[EmailJobProcessor] Sending email...', {
    recipient: to,
    subject,
    templateId,
    bodyLength: body.length,
    hasTemplateData: !!templateData,
  });

  // Simulate remote SMTP / API delivery delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Log successful dispatch
  logger.info(`[EmailJobProcessor] Email sent successfully to ${to}`);
};

// Instantiate queue
const emailQueue = getOrCreateQueue<EmailJobData>('email-notifications', processEmailJob);

export async function queueEmailNotification(data: EmailJobData) {
  logger.info(`[EmailService] Queueing email for delivery to ${data.to}`, { subject: data.subject });
  await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}
