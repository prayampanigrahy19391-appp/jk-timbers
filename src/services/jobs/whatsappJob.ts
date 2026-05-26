import { getOrCreateQueue } from '@/lib/queue';
import { logger } from '@/lib/logger';

export interface WhatsAppJobData {
  to: string;
  message: string;
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. +14155238886

const isTwilioConfigured = !!(accountSid && authToken && whatsappFrom);

const processWhatsAppJob = async (job: { data: WhatsAppJobData }) => {
  const { to, message } = job.data;

  // Normalize number to E.164 format (defaulting to India +91 if it's 10 digits)
  let formattedTo = to.trim();
  if (/^\d{10}$/.test(formattedTo)) {
    formattedTo = `+91${formattedTo}`;
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = `+91${formattedTo}`;
  }

  logger.info('[WhatsAppJobProcessor] Sending WhatsApp message...', {
    recipient: formattedTo,
    messageLength: message.length,
  });

  if (isTwilioConfigured) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    // Twilio From number must be prefixed with whatsapp:
    const fromNumber = whatsappFrom.startsWith('whatsapp:') ? whatsappFrom : `whatsapp:${whatsappFrom}`;
    const toNumber = formattedTo.startsWith('whatsapp:') ? formattedTo : `whatsapp:${formattedTo}`;

    const bodyParams = new URLSearchParams();
    bodyParams.append('To', toNumber);
    bodyParams.append('From', fromNumber);
    bodyParams.append('Body', message);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Twilio API responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      logger.info(`[WhatsAppJobProcessor] WhatsApp sent successfully to ${formattedTo}`, { sid: resData.sid });
    } catch (error) {
      logger.error('Failed to send WhatsApp via Twilio', { error: error instanceof Error ? error : new Error(String(error)), recipient: formattedTo });
      throw error;
    }
  } else {
    // Mock delivery mode
    logger.info('MOCK WHATSAPP SENDING:', {
      from: whatsappFrom || 'MOCK_TWILIO_SENDER',
      to: formattedTo,
      message,
    });
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const whatsappQueue = getOrCreateQueue<WhatsAppJobData>('whatsapp-notifications', processWhatsAppJob);

export async function queueWhatsAppNotification(data: WhatsAppJobData) {
  logger.info(`[WhatsAppService] Queueing WhatsApp for delivery to ${data.to}`);
  await whatsappQueue.add('send-whatsapp', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}
