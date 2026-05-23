import { getOrCreateQueue } from '@/lib/queue';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { getPublicUrl } from '@/lib/storage';

export interface InvoiceJobData {
  orderId: string;
  invoiceNumber: string;
}

// Background invoice builder (HTML-to-PDF / Puppeteer simulator)
const processInvoiceJob = async (job: { data: InvoiceJobData }) => {
  const { orderId, invoiceNumber } = job.data;

  logger.info(`[InvoiceProcessor] Generating PDF for Invoice: ${invoiceNumber}`, { orderId });

  // Fetch the full order details from Database
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    throw new Error(`Order with ID ${orderId} not found. Cannot generate invoice.`);
  }

  // Simulate heavy PDF rendering (e.g. Chrome/Puppeteer loading HTML layout)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Construct fake invoice binary payload and simulate uploading to AWS S3 storage
  const mockS3Key = `invoices/${invoiceNumber}.pdf`;
  const pdfUrl = getPublicUrl ? getPublicUrl(mockS3Key) : `https://s3.amazonaws.com/jk-timbers-bucket/${mockS3Key}`;

  // Update Invoice record with generated URL/metadata
  await prisma.invoice.update({
    where: { invoiceNumber },
    data: {
      metadata: {
        pdfUrl,
        storageKey: mockS3Key,
        generatedAt: new Date().toISOString(),
        itemsCount: order.orderItems.length,
      },
    },
  });

  logger.info(`[InvoiceProcessor] Generated PDF and stored on S3. Update complete.`, {
    invoiceNumber,
    pdfUrl,
  });
};

// Instantiate queue
const invoiceQueue = getOrCreateQueue<InvoiceJobData>('invoice-generation', processInvoiceJob);

export async function queueInvoiceGeneration(data: InvoiceJobData) {
  logger.info(`[InvoiceService] Queueing invoice generation: ${data.invoiceNumber}`);
  await invoiceQueue.add('generate-pdf', data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  });
}
