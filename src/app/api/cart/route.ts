import { NextRequest, NextResponse } from 'next/server';
import { syncCart, getCart } from '@/services/cartService';
import { z } from 'zod';
import { auth } from '@/../auth';

const cartItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().positive(),
});

const cartPayloadSchema = z.object({
  token: z.string().nullish(),
  items: z.array(cartItemSchema),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? request.cookies.get('cart_token')?.value;
  const userId = session?.user?.id;

  if (!token && !userId) {
    return NextResponse.json({ success: false, error: 'Cart token or userId is required.' }, { status: 400 });
  }

  const cart = await getCart(token, userId);
  return NextResponse.json({ success: true, cart });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json().catch(() => null);
  const result = cartPayloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ success: false, error: 'Invalid cart payload', details: result.error.flatten() }, { status: 400 });
  }

  const token = result.data.token ?? request.cookies.get('cart_token')?.value;

  try {
    const cart = await syncCart(token, session?.user?.id, result.data.items);
    const response = NextResponse.json({ success: true, cart });

    if (cart?.token && cart.token !== token) {
      response.cookies.set('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to synchronize cart.' },
      { status: 409 }
    );
  }
}
