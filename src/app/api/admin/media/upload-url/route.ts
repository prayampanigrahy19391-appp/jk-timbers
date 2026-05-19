import { NextResponse } from 'next/server';
import { getSignedUploadUrl } from '@/lib/storage';
import { requireAdminSession } from '@/lib/apiAuth';

const ALLOWLIST = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = await request.json();
    const { filename, mimeType } = body;
    if (!filename || !mimeType) {
      return NextResponse.json({ error: 'filename and mimeType required' }, { status: 400 });
    }

    if (!ALLOWLIST.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported mime type' }, { status: 400 });
    }

    const signed = await getSignedUploadUrl(filename, mimeType);
    return NextResponse.json({ success: true, data: signed });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
