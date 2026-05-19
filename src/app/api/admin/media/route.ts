import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApiAuthError, requireStaffSession } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function handleRouteError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : 'Media upload failed.' },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffSession();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File is required.' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'Image must be 5MB or smaller.' }, { status: 400 });
    }

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const storagePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(storagePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      data: {
        url: `/uploads/products/${filename}`,
        storageKey: `products/${filename}`,
        mimeType: file.type,
        size: file.size,
      },
    }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
