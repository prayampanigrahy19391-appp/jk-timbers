import nodemailer from 'nodemailer';
import { logger } from './logger';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || 'no-reply@jktimbers.com';

const isSmtpConfigured = !!(host && user && pass);

let transporter: nodemailer.Transporter | null = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
} else {
  logger.info('SMTP is not configured. Email notifications will fall back to log mode.');
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `JK Timbers <${from}>`,
        to,
        subject,
        text,
        html,
      });
      logger.info('Email sent successfully via SMTP', { messageId: info.messageId, to, subject });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email via SMTP', { error: error instanceof Error ? error : new Error(String(error)), to, subject });
      throw error;
    }
  } else {
    logger.info('MOCK EMAIL SENDING:', {
      from,
      to,
      subject,
      text,
      html,
    });
    return { success: true, mock: true };
  }
}
