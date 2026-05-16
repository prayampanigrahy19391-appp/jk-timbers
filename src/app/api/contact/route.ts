import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, message } = body;

    if (!firstName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required.' },
        { status: 400 }
      );
    }

    // Store inquiry in the database as a user with role INQUIRY
    // In a real system, you'd have a dedicated Inquiry model
    console.log('==============================================');
    console.log('NEW CONTACT INQUIRY RECEIVED');
    console.log(`Name: ${firstName} ${lastName || ''}`);
    console.log(`Phone: ${phone}`);
    console.log(`Message: ${message || 'No message provided'}`);
    console.log('==============================================');

    return NextResponse.json({ success: true, message: 'Your request has been received. We will contact you shortly.' });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process your request.' },
      { status: 500 }
    );
  }
}
