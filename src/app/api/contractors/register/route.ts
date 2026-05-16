import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, gstNumber, email } = body;

    if (!firstName || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    console.log('==============================================');
    console.log('NEW CONTRACTOR APPLICATION RECEIVED');
    console.log(`Name: ${firstName} ${lastName || ''}`);
    console.log(`Company: ${company || 'N/A'}`);
    console.log(`GST: ${gstNumber || 'N/A'}`);
    console.log(`Email: ${email}`);
    console.log('==============================================');

    return NextResponse.json({ success: true, message: 'Your application has been received. Our team will review it within 48 hours.' });
  } catch (error) {
    console.error('Contractor Registration Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process your application.' },
      { status: 500 }
    );
  }
}
