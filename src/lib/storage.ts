import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.STORAGE_BUCKET ?? process.env.AWS_S3_BUCKET ?? 'jk-timbers-uploads';
const REGION = process.env.STORAGE_REGION ?? process.env.AWS_REGION ?? 'us-east-1';

const s3 = new S3Client({ region: REGION });

export type SignedUpload = {
  url: string;
  storageKey: string;
  publicUrl: string;
};

export function generateStorageKey(filename: string) {
  const id = crypto.randomBytes(8).toString('hex');
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `products/${Date.now()}-${id}-${safe}`;
}

export async function getSignedUploadUrl(filename: string, mimeType: string): Promise<SignedUpload> {
  const storageKey = generateStorageKey(filename);

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: mimeType,
    ACL: 'private',
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
  const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${storageKey}`;

  return { url, storageKey, publicUrl };
}

export function getPublicUrl(storageKey: string) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${storageKey}`;
}
