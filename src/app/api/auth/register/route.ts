import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or phone already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email || undefined,
        phone: phone || undefined,
        password: hashedPassword,
        role: Role.CUSTOMER,
      }
    });

    return NextResponse.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
