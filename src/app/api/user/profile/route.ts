import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    zipCode: z.string().optional().or(z.literal('')),
  }).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Exclude password and sensitive info
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    const defaultAddress = safeUser.addresses[0] || null;

    return NextResponse.json({ success: true, user: safeUser, address: defaultAddress });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, phone, address } = result.data;
    const normalizedPhone = phone?.replace(/\D/g, '').trim() || null;

    // Update user details
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone: normalizedPhone },
    });

    // Handle Address Update
    if (address && (address.street || address.city || address.zipCode)) {
      // Find existing default address
      const existingAddress = await prisma.address.findFirst({
        where: { userId: session.user.id, isDefault: true }
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            street: address.street || '',
            city: address.city || '',
            zipCode: address.zipCode || '',
          }
        });
      } else {
        await prisma.address.create({
          data: {
            userId: session.user.id,
            street: address.street || '',
            city: address.city || '',
            zipCode: address.zipCode || '',
            isDefault: true,
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Phone number already in use.' }, { status: 409 });
    }

    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
